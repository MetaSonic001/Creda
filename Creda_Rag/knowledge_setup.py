#knowledge_setup.py
import asyncio
import chromadb
import os
import json
import sqlite3
import time
import re
from datetime import datetime, timedelta
from chromadb.utils import embedding_functions
from loguru import logger
from typing import List, Dict, Any, Optional
from pathlib import Path
import hashlib  # Added for generating consistent IDs based on URL

# Configure logging
logger.add("financial_agent.log", rotation="1 MB", level="INFO")

# Import optional dependencies with fallbacks
try:
    import pandas as pd
    HAS_PANDAS = True
except ImportError:
    logger.warning("Pandas not installed - using basic data structures")
    HAS_PANDAS = False

try:
    import yfinance as yf
    HAS_YFINANCE = True
except ImportError:
    logger.warning("yfinance not installed - using mock stock data")
    HAS_YFINANCE = False

try:
    from crawl4ai import AsyncWebCrawler
    from crawl4ai.extraction_strategy import NoExtractionStrategy
    HAS_CRAWL4AI = True
except ImportError:
    logger.warning("crawl4ai not installed - using curated data only")
    HAS_CRAWL4AI = False

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    logger.warning("requests not installed - no web data fetching")
    HAS_REQUESTS = False

try:
    from textblob import TextBlob
    HAS_TEXTBLOB = True
except ImportError:
    logger.warning("TextBlob not installed - using basic text processing")
    HAS_TEXTBLOB = False

class FinancialDataCrawler:
    def __init__(self):
        self.db_path = "financial_data.db"
        self.setup_database()
        
    def setup_database(self):
        """Setup SQLite database for caching crawled data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables for different data types
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS crawled_content (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT UNIQUE,
                title TEXT,
                content TEXT,
                category TEXT,
                source TEXT,
                crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                relevance_score REAL
            )
        ''')
        # Add index for faster lookup
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_url ON crawled_content (url)')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS stock_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT,
                data TEXT,
                data_type TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tax_rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                content TEXT,
                effective_date TEXT,
                source TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("SQLite database setup completed")

    async def crawl_financial_websites(self):
        """Crawl major financial websites for latest information"""
        if not HAS_CRAWL4AI:
            logger.info("Crawl4AI not available - skipping web crawling")
            return
        
        financial_sources = [
            {
                "url": "https://www.moneycontrol.com/news/business/personal-finance/",
                "category": "personal_finance",
                "source": "Moneycontrol"
            },
            {
                "url": "https://economictimes.indiatimes.com/wealth",
                "category": "wealth_management",
                "source": "Economic Times"
            },
            {
                "url": "https://www.livemint.com/money",
                "category": "investment_news",
                "source": "LiveMint"
            },
            {
                "url": "https://cleartax.in/s/income-tax-guide",
                "category": "tax_planning",
                "source": "ClearTax"
            },
            {
                "url": "https://groww.in/blog/category/tax",
                "category": "tax_saving",
                "source": "Groww"
            }
        ]
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            async with AsyncWebCrawler(verbose=True) as crawler:
                for source in financial_sources:
                    # Skip if URL was crawled recently (e.g., within 24 hours)
                    cursor.execute("SELECT crawled_at FROM crawled_content WHERE url = ?", (source['url'],))
                    result = cursor.fetchone()
                    if result and (datetime.now() - datetime.fromisoformat(result[0])).total_seconds() < 86400:
                        logger.info(f"Skipping {source['url']} - recently crawled")
                        continue
                    
                    try:
                        logger.info(f"Crawling: {source['url']}")
                        
                        extraction_strategy = NoExtractionStrategy()
                        
                        result = await crawler.arun(
                            url=source['url'],
                            extraction_strategy=extraction_strategy,
                            bypass_cache=True,  # Force fresh crawl
                            css_selector="article, .content, .post, .news-item, main, .story-content, .article-content",
                            word_count_threshold=100,
                            exclude_external_links=True,
                            wait_for_images=False,
                            delay_before_return_html=2.0,
                            simulate_user=True,
                            magic=True
                        )
                        
                        if result.success:
                            title = getattr(result, 'title', '') or ''
                            content = result.cleaned_html or result.html or ''
                            relevance_score = 0.7
                            
                            await self.store_crawled_content(
                                url=source['url'],
                                title=title,
                                content=content,
                                category=source['category'],
                                source=source['source'],
                                relevance_score=relevance_score
                            )
                            
                            logger.success(f"Successfully crawled: {source['source']}")
                        else:
                            logger.error(f"Failed to crawl: {source['url']}")
                            
                        # Rate limiting
                        await asyncio.sleep(3)
                        
                    except Exception as e:
                        logger.error(f"Error crawling {source['url']}: {str(e)}")
                        continue
        except Exception as e:
            logger.error(f"Web crawling error: {str(e)}")
        finally:
            conn.close()

    async def store_crawled_content(self, url: str, title: str, content: str, 
                                  category: str, source: str, relevance_score: float):
        """Store crawled content in SQLite database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO crawled_content 
                (url, title, content, category, source, relevance_score)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (url, title, content, category, source, relevance_score))
            
            conn.commit()
            logger.info(f"Stored content from {source}: {title[:50] if title else 'No title'}...")
            
        except Exception as e:
            logger.error(f"Error storing content: {str(e)}")
        finally:
            conn.close()

    def fetch_indian_stock_data(self):
        """Fetch Indian stock market data with fallback to mock data"""
        logger.info("Fetching Indian stock market data...")
        
        # NSE Top stocks
        nifty_symbols = [
            "RELIANCE", "TCS", "HDFCBANK", "INFY", "HINDUNILVR", "ICICIBANK",
            "KOTAKBANK", "SBIN", "BHARTIARTL", "BAJFINANCE", "ITC", "ASIANPAINT",
            "MARUTI", "AXISBANK", "LT", "WIPRO", "TITAN", "NESTLEIND"
        ]
        
        stock_data = {}
        
        if HAS_YFINANCE:
            for symbol in nifty_symbols[:10]:  # Limit to 10 for faster processing
                try:
                    ticker = yf.Ticker(f"{symbol}.NS")
                    hist = ticker.history(period="1y")
                    
                    if not hist.empty:
                        current_price = hist['Close'].iloc[-1]
                        year_high = hist['High'].max()
                        year_low = hist['Low'].min()
                        returns_1yr = ((current_price - hist['Close'].iloc[0]) / hist['Close'].iloc[0]) * 100
                        
                        daily_returns = hist['Close'].pct_change().dropna()
                        volatility = daily_returns.std() * (252 ** 0.5) * 100
                        
                        info = ticker.info
                        
                        stock_info = {
                            "symbol": symbol,
                            "current_price": float(current_price),
                            "year_high": float(year_high),
                            "year_low": float(year_low),
                            "returns_1yr": float(returns_1yr),
                            "volatility": float(volatility),
                            "market_cap": info.get('marketCap', 'N/A'),
                            "pe_ratio": info.get('trailingPE', 'N/A'),
                            "sector": info.get('sector', 'N/A'),
                            "last_updated": datetime.now().isoformat()
                        }
                        
                        stock_data[symbol] = stock_info
                        self.store_stock_data(symbol, json.dumps(stock_info, default=str), "price_data")
                    
                    time.sleep(0.2)  # Rate limiting
                    
                except Exception as e:
                    logger.error(f"Error fetching data for {symbol}: {str(e)}")
                    continue
        else:
            # Mock data when yfinance is not available
            logger.info("Using mock stock data (yfinance not installed)")
            stock_data = self.get_mock_stock_data(nifty_symbols[:10])
            for symbol, data in stock_data.items():
                self.store_stock_data(symbol, json.dumps(data, default=str), "price_data")
        
        logger.info(f"Processed data for {len(stock_data)} stocks")
        return stock_data

    def get_mock_stock_data(self, symbols: List[str]) -> Dict[str, Any]:
        """Generate realistic mock stock data when yfinance is not available"""
        import random
        
        mock_data = {}
        base_prices = {
            "RELIANCE": 2800, "TCS": 3600, "HDFCBANK": 1650, "INFY": 1450,
            "ICICIBANK": 950, "SBIN": 550, "BHARTIARTL": 900, "ITC": 420,
            "WIPRO": 400, "MARUTI": 10500
        }
        
        for symbol in symbols:
            base_price = base_prices.get(symbol, random.randint(100, 1000))
            volatility = random.uniform(15, 35)
            returns = random.uniform(-20, 25)
            
            mock_data[symbol] = {
                "symbol": symbol,
                "current_price": base_price + random.uniform(-50, 50),
                "year_high": base_price * 1.3,
                "year_low": base_price * 0.7,
                "returns_1yr": returns,
                "volatility": volatility,
                "market_cap": f"{random.randint(50000, 500000)} crores",
                "pe_ratio": random.uniform(15, 35),
                "sector": random.choice(["IT", "Banking", "FMCG", "Auto", "Telecom"]),
                "last_updated": datetime.now().isoformat()
            }
        
        return mock_data

    def store_stock_data(self, symbol: str, data: str, data_type: str):
        """Store stock data in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO stock_data (symbol, data, data_type)
                VALUES (?, ?, ?)
            ''', (symbol, data, data_type))
            conn.commit()
            
        except Exception as e:
            logger.error(f"Error storing stock data: {str(e)}")
        finally:
            conn.close()

    def fetch_mutual_fund_data(self):
        """Fetch mutual fund and SIP data"""
        logger.info("Loading mutual fund data...")
        
        popular_funds = [
            {
                "name": "SBI Blue Chip Fund",
                "category": "Large Cap",
                "returns_1yr": 14.2,
                "returns_3yr": 16.8,
                "expense_ratio": 1.95,
                "risk_level": "Moderate",
                "min_investment": 100,
                "fund_house": "SBI Mutual Fund"
            },
            {
                "name": "HDFC Top 100 Fund",
                "category": "Large Cap", 
                "returns_1yr": 13.8,
                "returns_3yr": 15.9,
                "expense_ratio": 1.87,
                "risk_level": "Moderate",
                "min_investment": 100,
                "fund_house": "HDFC Mutual Fund"
            },
            {
                "name": "ICICI Prudential Balanced Advantage Fund",
                "category": "Hybrid",
                "returns_1yr": 12.1,
                "returns_3yr": 14.2,
                "expense_ratio": 1.12,
                "risk_level": "Moderate",
                "min_investment": 100,
                "fund_house": "ICICI Prudential"
            },
            {
                "name": "Axis Long Term Equity Fund",
                "category": "ELSS",
                "returns_1yr": 15.4,
                "returns_3yr": 17.6,
                "expense_ratio": 1.28,
                "risk_level": "High",
                "min_investment": 500,
                "fund_house": "Axis Mutual Fund"
            },
            {
                "name": "Mirae Asset Large Cap Fund",
                "category": "Large Cap",
                "returns_1yr": 14.6,
                "returns_3yr": 16.3,
                "expense_ratio": 1.75,
                "risk_level": "Moderate",
                "min_investment": 100,
                "fund_house": "Mirae Asset"
            },
            {
                "name": "SBI Small Cap Fund",
                "category": "Small Cap",
                "returns_1yr": 18.5,
                "returns_3yr": 20.2,
                "expense_ratio": 2.1,
                "risk_level": "High",
                "min_investment": 500,
                "fund_house": "SBI Mutual Fund"
            },
            {
                "name": "Parag Parikh Long Term Equity Fund",
                "category": "Multi Cap",
                "returns_1yr": 16.8,
                "returns_3yr": 18.4,
                "expense_ratio": 1.15,
                "risk_level": "Moderate-High",
                "min_investment": 1000,
                "fund_house": "PPFAS Mutual Fund"
            },
            {
                "name": "UTI Nifty 50 Index Fund",
                "category": "Index Fund",
                "returns_1yr": 12.8,
                "returns_3yr": 14.5,
                "expense_ratio": 0.2,
                "risk_level": "Moderate",
                "min_investment": 100,
                "fund_house": "UTI Mutual Fund"
            }
        ]
        
        fund_data = {}
        for fund in popular_funds:
            fund_data[fund["name"]] = {
                "category": fund["category"],
                "returns_1yr": fund["returns_1yr"],
                "returns_3yr": fund["returns_3yr"],
                "expense_ratio": fund["expense_ratio"],
                "risk_level": fund["risk_level"],
                "min_investment": fund["min_investment"],
                "fund_house": fund["fund_house"]
            }
        
        return fund_data

class FinancialKnowledgeBase:
    def __init__(self):
        try:
            self.client = chromadb.PersistentClient(path="./chroma_financial_db")
            self.embedding_function = embedding_functions.DefaultEmbeddingFunction()
            self.setup_collections()
            self.crawler = FinancialDataCrawler()
            logger.info("ChromaDB initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing ChromaDB: {str(e)}")
            raise
        
    def setup_collections(self):
        """Setup ChromaDB collections for different financial data types"""
        # Removed deletion of existing collections to persist and accumulate/update data across runs
        
        # Create collections if they don't exist
        self.financial_knowledge = self.client.get_or_create_collection(
            name="financial_knowledge",
            embedding_function=self.embedding_function,
            metadata={"description": "General financial knowledge and advice"}
        )
        
        self.tax_rules = self.client.get_or_create_collection(
            name="tax_rules",
            embedding_function=self.embedding_function,
            metadata={"description": "Tax rules, regulations, and planning strategies"}
        )
        
        self.investment_advice = self.client.get_or_create_collection(
            name="investment_advice",
            embedding_function=self.embedding_function,
            metadata={"description": "Investment strategies and portfolio advice"}
        )
        
        self.stock_analysis = self.client.get_or_create_collection(
            name="stock_analysis",
            embedding_function=self.embedding_function,
            metadata={"description": "Stock analysis and market data"}
        )
        
        logger.info("ChromaDB collections setup (created if not exist)")

    async def populate_knowledge_base(self):
        """Populate the knowledge base with financial data"""
        logger.info("Populating financial knowledge base...")
        
        # 1. Add curated financial knowledge (will overwrite if IDs exist, which is fine for static data)
        await self.add_curated_knowledge()
        
        # 2. Fetch stock market data (fresh each time)
        stock_data = self.crawler.fetch_indian_stock_data()
        
        # 3. Fetch mutual fund data (static, but added/updated)
        fund_data = self.crawler.fetch_mutual_fund_data()
        
        # 4. Crawl latest financial data from web (if available) and update/add
        try:
            await self.crawler.crawl_financial_websites()
            await self.process_crawled_data()
        except Exception as e:
            logger.warning(f"Web crawling had issues: {e}")
            logger.info("Continuing with curated data and market information...")
        
        # 5. Add/update stock analysis data
        self.add_stock_data(stock_data)
        
        # 6. Add/update mutual fund data
        self.add_fund_data(fund_data)
        
        logger.success("Financial knowledge base populated successfully!")

    async def add_curated_knowledge(self):
        """Add comprehensive curated financial knowledge"""
        financial_knowledge_base = [
            # Tax Planning & Saving Strategies
            {
                "text": "Section 80C of Income Tax Act allows deduction up to Rs. 1.5 lakh per year. Investments eligible under 80C include ELSS mutual funds, PPF, NSC, ULIP, life insurance premiums, home loan principal repayment, and children's tuition fees. ELSS funds have the shortest lock-in period of 3 years among all 80C investments and offer potential for higher returns compared to traditional tax-saving instruments.",
                "metadata": {
                    "category": "tax_planning",
                    "section": "80C_deductions",
                    "priority": "high",
                    "keywords": "80C, tax saving, ELSS, PPF, deduction, 1.5 lakh, lock-in period"
                }
            },
            {
                "text": "Section 80D provides deduction for health insurance premiums. Up to Rs. 25,000 for self and family, additional Rs. 25,000 for parents below 60 years, Rs. 50,000 for parents above 60 years. Preventive health check-up allows Rs. 5,000 deduction within the overall limit. Total maximum deduction can go up to Rs. 1 lakh for senior citizens.",
                "metadata": {
                    "category": "tax_planning",
                    "section": "80D_health_insurance",
                    "priority": "high",
                    "keywords": "80D, health insurance, medical premium, parents, preventive checkup, senior citizens"
                }
            },
            {
                "text": "New tax regime vs Old tax regime comparison for FY 2023-24: New regime offers lower tax rates but eliminates most deductions. Old regime allows deductions under 80C, 80D, HRA, home loan interest, etc. Choose new regime if total deductions are less than Rs. 2-2.5 lakhs annually. Old regime beneficial for individuals with multiple investments and deductions. Tax savings under old regime can be substantial with proper planning.",
                "metadata": {
                    "category": "tax_planning",
                    "section": "tax_regime_comparison",
                    "priority": "high",
                    "keywords": "new tax regime, old tax regime, FY 2023-24, comparison, deductions, tax rates, HRA"
                }
            },
            {
                "text": "HRA (House Rent Allowance) exemption calculation: Minimum of (i) Actual HRA received, (ii) Actual rent paid minus 10% of basic salary, (iii) 50% of basic salary for metro cities (Mumbai, Delhi, Chennai, Kolkata) or 40% for non-metro cities. HRA is not available under new tax regime but can provide significant tax benefits under old regime.",
                "metadata": {
                    "category": "tax_planning",
                    "section": "HRA_exemption",
                    "priority": "high",
                    "keywords": "HRA, house rent allowance, exemption, metro cities, basic salary, tax benefits"
                }
            },
            
            # Investment & Portfolio Management
            {
                "text": "Asset allocation based on age: Equity percentage = 100 minus age rule is a basic guideline. 25-year-old should ideally have 75% equity, 45-year-old should have 55% equity. However, consider risk tolerance, income stability, and financial goals. Young investors can take 80-90% equity exposure for long-term wealth creation. Rebalance portfolio annually to maintain desired allocation.",
                "metadata": {
                    "category": "investment_strategy",
                    "section": "asset_allocation",
                    "priority": "high",
                    "keywords": "asset allocation, age-based investing, equity percentage, risk tolerance, rebalancing, wealth creation"
                }
            },
            {
                "text": "SIP (Systematic Investment Plan) benefits: Rupee cost averaging reduces average cost per unit over time through market volatility. Start with minimum Rs. 500 per month and increase by 10-15% annually (step-up SIP). Don't stop SIP during market downturns - that's when you accumulate more units at lower prices. Historical data shows SIP in diversified equity funds for 15+ years has never given negative returns.",
                "metadata": {
                    "category": "investment_strategy",
                    "section": "SIP_benefits",
                    "priority": "high",
                    "keywords": "SIP, systematic investment, rupee cost averaging, step-up SIP, market downturns, long-term investing"
                }
            },
            {
                "text": "Emergency fund planning: Maintain 6-12 months of monthly expenses in highly liquid instruments. Higher job security and stable income = 6 months, freelancers and variable income = 12 months. Keep in liquid mutual funds, ultra-short-term funds, or high-yield savings accounts. Emergency fund should be separate from investments and immediately accessible without penalties.",
                "metadata": {
                    "category": "financial_planning",
                    "section": "emergency_fund",
                    "priority": "high",
                    "keywords": "emergency fund, 6-12 months expenses, liquid funds, job security, accessible funds"
                }
            },
            
            # Mutual Funds & Investment Options
            {
                "text": "Types of mutual funds by market capitalization: Large cap funds (low risk, stable returns 10-12%), Mid cap funds (moderate risk, higher returns 12-15%), Small cap funds (high risk, highest potential returns 15-18%), Multi-cap funds (diversified across all market caps). Large cap suitable for conservative investors, mid and small cap for aggressive investors with longer time horizon.",
                "metadata": {
                    "category": "mutual_funds",
                    "section": "fund_types_market_cap",
                    "priority": "high",
                    "keywords": "large cap, mid cap, small cap, multi cap, risk-return profile, market capitalization"
                }
            },
            {
                "text": "Mutual fund categories by investment style: Index funds (passive, low cost, market returns), Active funds (professional management, potential to outperform), Sectoral funds (single sector exposure, high risk), Thematic funds (investment theme based). Index funds have expense ratios of 0.1-0.5%, active funds 1-2.5%. For beginners, diversified equity funds or index funds are recommended.",
                "metadata": {
                    "category": "mutual_funds",
                    "section": "fund_categories",
                    "priority": "medium",
                    "keywords": "index funds, active funds, sectoral funds, expense ratio, passive investing"
                }
            },
            {
                "text": "Direct vs Regular mutual fund plans: Direct plans have lower expense ratio (0.5-1% lower annually) as no distributor commission. Invest directly through fund house websites, mobile apps, or platforms like Groww, Zerodha Coin, Kuvera. Over 20-year investment horizon, 1% expense ratio difference can result in 20-25% higher corpus in direct plans. However, regular plans provide advisory support.",
                "metadata": {
                    "category": "mutual_funds",
                    "section": "direct_vs_regular",
                    "priority": "high",
                    "keywords": "direct plan, regular plan, expense ratio, distributor commission, long-term impact"
                }
            },
            
            # Retirement Planning (enhanced for personalization)
            {
                "text": "Retirement corpus calculation using 25x rule: If monthly expenses in retirement are Rs. 50,000, need Rs. 1.25 crore corpus (50,000 x 12 x 25). This assumes 4% withdrawal rate. Factor in inflation - expenses will be higher after 25-30 years. For a 30-year-old with Rs. 10 lakh annual income, monthly SIP of Rs. 15,000 at 12% return for 35 years builds Rs. 5 crore corpus. Adjust based on age, income, and current savings.",
                "metadata": {
                    "category": "retirement_planning",
                    "section": "corpus_calculation",
                    "priority": "high",
                    "keywords": "retirement corpus, 25x rule, 4% withdrawal, power of compounding, inflation impact, personalized SIP"
                }
            },
            {
                "text": "NPS (National Pension System) benefits: Additional 80CCD(1B) deduction of Rs. 50,000 over and above 80C limit, total tax benefit up to Rs. 2 lakh. Government co-contribution for central government employees. Equity exposure up to 75% until age 50, then gradually reduced. Very low cost index funds with expense ratios of 0.01-0.25%. Partial withdrawal allowed after 3 years for specific needs like higher education, marriage, house purchase. Ideal for long-term retirement with tax advantages.",
                "metadata": {
                    "category": "retirement_planning",
                    "section": "NPS_benefits",
                    "priority": "medium",
                    "keywords": "NPS, 80CCD(1B), 50000 additional deduction, equity exposure, low cost, partial withdrawal, retirement"
                }
            },
            {
                "text": "PPF (Public Provident Fund) features: 15-year lock-in with option to extend in 5-year blocks. Current interest rate around 7.1% per year (tax-free). Maximum investment Rs. 1.5 lakh per year under Section 80C. Loan facility available from 7th year, partial withdrawal from 7th year. Triple tax benefit - investment deduction, interest exemption, maturity amount tax-free (EEE status). Suitable for conservative retirement planning.",
                "metadata": {
                    "category": "retirement_planning",
                    "section": "PPF_features",
                    "priority": "medium",
                    "keywords": "PPF, 15-year lock-in, 7.1% interest, 1.5 lakh limit, triple tax benefit, loan facility, retirement"
                }
            },
            
            # Insurance Planning
            {
                "text": "Life insurance coverage calculation: 10-15 times of annual income or Human Life Value method. For Rs. 10 lakh annual income, minimum Rs. 1-1.5 crore coverage needed. Term insurance is cheapest way to get high coverage - Rs. 1 crore cover for 30-year-old costs Rs. 10,000-15,000 annually. Avoid mixing insurance with investment (ULIP, endowment, money-back policies). Buy pure term insurance and invest separately in mutual funds.",
                "metadata": {
                    "category": "insurance_planning",
                    "section": "life_insurance_coverage",
                    "priority": "high",
                    "keywords": "life insurance, 10-15 times income, term insurance, avoid ULIP, pure term plan"
                }
            },
            {
                "text": "Health insurance planning: Family floater vs individual policies consideration. Sum insured should be minimum Rs. 5 lakh in metro cities, Rs. 3 lakh in smaller cities, but preferably Rs. 10-20 lakh considering medical inflation. Include parents in separate policy if they're senior citizens. Consider top-up or super top-up policies for higher coverage at lower premium. Pre-existing diseases have waiting periods of 2-4 years.",
                "metadata": {
                    "category": "insurance_planning",
                    "section": "health_insurance",
                    "priority": "high",
                    "keywords": "health insurance, family floater, 5-10 lakh coverage, top-up policy, medical inflation"
                }
            },
            
            # Stock Market Investing
            {
                "text": "Stock selection fundamental analysis: Look for companies with consistent revenue growth (15%+ annually), strong competitive advantage or moat, low debt-to-equity ratio (below 0.5 for most sectors), good return on equity (ROE > 15%), reasonable valuation (PE ratio compared to industry average and growth rate). Focus on quality management, corporate governance, and business model sustainability.",
                "metadata": {
                    "category": "stock_investing",
                    "section": "fundamental_analysis",
                    "priority": "medium",
                    "keywords": "fundamental analysis, revenue growth, competitive advantage, debt-equity ratio, ROE, PE ratio"
                }
            },
            {
                "text": "Portfolio diversification rules: Don't put more than 5-10% of portfolio in single stock, maximum 15-20% in single sector. Key sectors in Indian market: IT, Banking, FMCG, Pharmaceuticals, Auto, Infrastructure, Energy. Consider cyclical vs non-cyclical sectors for balanced exposure. Maintain geographic diversification - don't ignore international exposure through international funds.",
                "metadata": {
                    "category": "stock_investing",
                    "section": "diversification",
                    "priority": "medium",
                    "keywords": "portfolio diversification, single stock limit, sectoral allocation, cyclical sectors, international exposure"
                }
            },
            {
                "text": "Market timing vs Time in market: Historical evidence shows time in market beats timing the market. Even missing the 10 best days in a year can significantly reduce returns. Dollar-cost averaging through SIP is more effective than trying to time market bottoms. Stay invested through market cycles - bear markets are temporary, long-term wealth creation is permanent for quality investments.",
                "metadata": {
                    "category": "investment_philosophy",
                    "section": "market_timing",
                    "priority": "high",
                    "keywords": "time in market, market timing, dollar cost averaging, bear markets, long-term investing"
                }
            },
            
            # ELSS and Tax Saving Funds
            {
                "text": "ELSS (Equity Linked Savings Scheme) advantages: Shortest 3-year lock-in period among 80C investments, potential for 12-15% annual returns over long term, fully equity-oriented for wealth creation, dividend option available. Best ELSS funds have consistent performance across market cycles. Can invest lump sum or through SIP. After lock-in, no restriction on withdrawal.",
                "metadata": {
                    "category": "tax_saving_investments",
                    "section": "ELSS_advantages",
                    "priority": "high",
                    "keywords": "ELSS, 3-year lock-in, 80C benefits, equity-oriented, 12-15% returns, SIP option"
                }
            },
            
            # Goal-based Financial Planning
            {
                "text": "Child education planning: Higher education costs inflate at 8-10% annually. For engineering course costing Rs. 20 lakh today, may cost Rs. 45-50 lakh after 15 years. Start SIP early - Rs. 8,000 monthly SIP for 15 years at 12% return creates Rs. 50 lakh corpus. Consider education-specific mutual funds or balanced funds for goal-based investing.",
                "metadata": {
                    "category": "goal_based_planning",
                    "section": "education_planning",
                    "priority": "medium",
                    "keywords": "education planning, education inflation, 8-10% cost increase, goal-based SIP"
                }
            },
            {
                "text": "Home purchase planning: Down payment typically 20% of property value, remaining through home loan. Factor in registration costs (7-10% of property value), maintenance costs, property taxes. Home loan interest up to Rs. 2 lakh deductible under Section 24, principal repayment under 80C. Consider opportunity cost of down payment vs rental yield and EMI.",
                "metadata": {
                    "category": "goal_based_planning",
                    "section": "home_purchase",
                    "priority": "medium",
                    "keywords": "home purchase, 20% down payment, Section 24 interest deduction, opportunity cost"
                }
            },
            
            # Current Tax Rules and Limits (FY 2023-24)
            {
                "text": "Income tax slabs for FY 2023-24: Old regime - up to Rs. 2.5 lakh (nil), Rs. 2.5-5 lakh (5%), Rs. 5-10 lakh (20%), above Rs. 10 lakh (30%). New regime - up to Rs. 3 lakh (nil), Rs. 3-6 lakh (5%), Rs. 6-9 lakh (10%), Rs. 9-12 lakh (15%), Rs. 12-15 lakh (20%), above Rs. 15 lakh (30%). Rebate under 87A available up to Rs. 7 lakh in new regime.",
                "metadata": {
                    "category": "current_tax_rules",
                    "section": "tax_slabs_2023_24",
                    "priority": "high",
                    "keywords": "income tax slabs, FY 2023-24, old regime, new regime, rebate 87A"
                }
            },
            
            # Digital Investment Platforms
            {
                "text": "Investment platforms comparison: Zerodha Coin (no charges for direct mutual funds), Groww (user-friendly interface), Paytm Money, ET Money, Kuvera (goal-based planning). Bank platforms like HDFC Securities, ICICI Direct available but may have higher charges. Choose platform based on features needed - research tools, goal planning, tax optimization, customer support quality.",
                "metadata": {
                    "category": "investment_platforms",
                    "section": "platform_comparison",
                    "priority": "low",
                    "keywords": "investment platforms, Zerodha Coin, Groww, direct mutual funds, platform features"
                }
            }
        ]
        
        # Tax-specific knowledge for tax_rules collection
        tax_knowledge_base = [
            {
                "text": "Advanced tax planning strategies: Tax loss harvesting in equity mutual funds (switch from growth to dividend option), LTCG optimization (stay invested for more than 1 year), step-up SIP to increase 80C utilization gradually, salary restructuring for HRA and transport allowance optimization. Plan tax-saving investments at beginning of financial year for maximum benefit.",
                "metadata": {
                    "category": "advanced_tax_planning",
                    "section": "tax_optimization_strategies",
                    "priority": "medium",
                    "keywords": "tax loss harvesting, LTCG, step-up SIP, salary restructuring, HRA optimization"
                }
            },
            {
                "text": "Capital gains taxation rules: Short-term capital gains (STCG) on equity - 15% if held for less than 1 year. Long-term capital gains (LTCG) on equity - 10% if gains exceed Rs. 1 lakh annually, with grandfathering benefit for investments made before Feb 1, 2018. Debt fund gains - STCG taxed as per tax slab, LTCG at 20% with indexation benefit.",
                "metadata": {
                    "category": "capital_gains_tax",
                    "section": "equity_debt_taxation",
                    "priority": "medium",
                    "keywords": "STCG 15%, LTCG 10%, 1 lakh exemption, debt fund taxation, indexation benefit"
                }
            }
        ]
        
        # Investment-specific knowledge for investment_advice collection (enhanced with horizon)
        investment_knowledge_base = [
            {
                "text": "SIP vs Lump sum investment decision matrix: SIP preferred during volatile markets, high valuations, regular income situations. Lump sum better during market lows, significant cash availability, long investment horizon (10+ years). Historical data shows lump sum outperforms SIP in rising markets, SIP outperforms in volatile/falling markets. For 5-10 year horizon, balanced approach; for 15+ years, SIP for rupee cost averaging.",
                "metadata": {
                    "category": "investment_decision_framework",
                    "section": "SIP_vs_lumpsum",
                    "priority": "medium",
                    "keywords": "SIP vs lump sum, market volatility, investment horizon, combination approach, 5-10 year, 15+ years"
                }
            },
            {
                "text": "Investment horizon guidelines: Short-term (1-3 years): Debt funds, FDs for capital preservation. Medium-term (3-7 years): Hybrid funds, balanced advantage for moderate growth. Long-term (7+ years): Equity funds, SIPs for wealth creation. Adjust based on age - younger investors can afford longer horizons with higher equity. Always consider risk tolerance and emergency fund before investing.",
                "metadata": {
                    "category": "investment_horizon",
                    "section": "horizon_guidelines",
                    "priority": "high",
                    "keywords": "investment horizon, short-term, medium-term, long-term, debt funds, equity SIP, risk tolerance"
                }
            }
        ]
        
        # Add to respective collections
        documents = [item["text"] for item in financial_knowledge_base]
        metadatas = [item["metadata"] for item in financial_knowledge_base]
        self.financial_knowledge.add(
            documents=documents,
            metadatas=metadatas,
            ids=[f"knowledge_{i}" for i in range(len(financial_knowledge_base))]
        )
        
        # Add tax-specific knowledge
        tax_documents = [item["text"] for item in tax_knowledge_base]
        tax_metadatas = [item["metadata"] for item in tax_knowledge_base]
        self.tax_rules.add(
            documents=tax_documents,
            metadatas=tax_metadatas,
            ids=[f"tax_{i}" for i in range(len(tax_knowledge_base))]
        )
        
        # Add investment-specific knowledge
        inv_documents = [item["text"] for item in investment_knowledge_base]
        inv_metadatas = [item["metadata"] for item in investment_knowledge_base]
        self.investment_advice.add(
            documents=inv_documents,
            metadatas=inv_metadatas,
            ids=[f"investment_{i}" for i in range(len(investment_knowledge_base))]
        )
        
        logger.info(f"Added {len(financial_knowledge_base)} general financial knowledge items")
        logger.info(f"Added {len(tax_knowledge_base)} tax-specific knowledge items")
        logger.info(f"Added {len(investment_knowledge_base)} investment-specific knowledge items")

    async def process_crawled_data(self):
        """Process crawled data and add to appropriate collections"""
        conn = sqlite3.connect(self.crawler.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT url, title, content, category, source, relevance_score 
                FROM crawled_content 
                WHERE relevance_score > 0.3 AND length(content) > 200
                ORDER BY relevance_score DESC
                LIMIT 50
            ''')
            
            crawled_data = cursor.fetchall()
        except sqlite3.OperationalError:
            logger.warning("No crawled data table found - skipping crawled data processing")
            conn.close()
            return
        
        conn.close()
        
        if not crawled_data:
            logger.info("No quality crawled data found to process")
            return
        
        # Process and categorize data
        tax_documents, tax_metadatas, tax_ids = [], [], []
        general_documents, general_metadatas, general_ids = [], [], []
        
        for url, title, content, category, source, relevance_score in crawled_data:
            if not content or len(content.strip()) < 100:
                continue
            
            # Clean and process content
            clean_content = self.clean_text(content)
            if len(clean_content) < 50:
                continue
            
            metadata = {
                "url": str(url),
                "title": str(title or "Unknown"),
                "category": str(category),
                "source": str(source),
                "relevance_score": str(relevance_score),
                "crawled_date": datetime.now().isoformat()
            }
            
            # Generate consistent ID based on URL hash for updating same URL content
            item_id = hashlib.md5(url.encode()).hexdigest()
            
            if category in ["tax_rules", "tax_planning", "tax_saving"]:
                tax_documents.append(clean_content[:2000])  # Limit length
                tax_metadatas.append(metadata)
                tax_ids.append(f"tax_crawled_{item_id}")
            else:
                general_documents.append(clean_content[:2000])
                general_metadatas.append(metadata)
                general_ids.append(f"general_crawled_{item_id}")
        
        # Add to collections (will update if ID exists, add if new)
        if tax_documents:
            try:
                self.tax_rules.add(
                    documents=tax_documents,
                    metadatas=tax_metadatas,
                    ids=tax_ids
                )
                logger.info(f"Added/Updated {len(tax_documents)} tax-related crawled documents")
            except Exception as e:
                logger.error(f"Error adding tax documents: {str(e)}")
        
        if general_documents:
            try:
                self.financial_knowledge.add(
                    documents=general_documents,
                    metadatas=general_metadatas,
                    ids=general_ids
                )
                logger.info(f"Added/Updated {len(general_documents)} general crawled documents")
            except Exception as e:
                logger.error(f"Error adding general documents: {str(e)}")

    def clean_text(self, text: str) -> str:
        """Clean and preprocess text"""
        if not text:
            return ""
        
        # Remove extra whitespace and newlines
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n+', '\n', text)
        
        # Remove HTML tags if any
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove special characters but keep financial symbols
        text = re.sub(r'[^\w\s\.\,\:\;\!\?\-\(\)\[\]\"\'₹\%]', '', text)
        
        # Remove very short sentences
        sentences = text.split('.')
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        text = '. '.join(sentences)
        
        return text.strip()

    def add_stock_data(self, stock_data: Dict[str, Any]):
        """Add stock analysis data to collection"""
        if not stock_data:
            logger.warning("No stock data to add")
            return
            
        documents, metadatas, ids = [], [], []
        
        for symbol, data in stock_data.items():
            if not data:
                continue
            
            # Create comprehensive stock analysis text
            risk_level = 'High' if data['volatility'] > 30 else 'Moderate' if data['volatility'] > 20 else 'Low'
            
            analysis_text = f"""Stock Analysis for {symbol}:
Current Price: ₹{data['current_price']:.2f}
52-week High: ₹{data['year_high']:.2f} | 52-week Low: ₹{data['year_low']:.2f}
1-Year Returns: {data['returns_1yr']:.1f}%
Volatility (Risk): {data['volatility']:.1f}% - {risk_level} Risk
Market Cap: {data.get('market_cap', 'N/A')}
P/E Ratio: {data.get('pe_ratio', 'N/A')}
Sector: {data.get('sector', 'N/A')}

Investment Analysis: This stock has shown {abs(data['returns_1yr']):.1f}% {'gains' if data['returns_1yr'] > 0 else 'losses'} in the past year. 
Risk Assessment: {risk_level} volatility makes it suitable for {'aggressive investors with high risk tolerance' if risk_level == 'High' else 'moderate investors' if risk_level == 'Moderate' else 'conservative investors'}.
Portfolio Allocation: Recommend maximum {'5-7%' if risk_level == 'High' else '8-10%' if risk_level == 'Moderate' else '10-12%'} of total portfolio in this stock.
Sector Performance: {data.get('sector', 'This sector')} has specific cyclical characteristics that investors should consider.
Long-term Suitability: {'High growth potential but requires patience' if risk_level == 'High' else 'Balanced growth with moderate risk' if risk_level == 'Moderate' else 'Stable returns with lower risk'}.
"""
            
            documents.append(analysis_text)
            metadatas.append({
                "symbol": str(symbol),
                "category": "stock_analysis",
                "current_price": str(data['current_price']),
                "returns_1yr": str(data['returns_1yr']),
                "volatility": str(data['volatility']),
                "risk_level": risk_level,
                "sector": str(data.get('sector', 'N/A')),
                "last_updated": str(data.get('last_updated', datetime.now().isoformat()))
            })
            ids.append(f"stock_{symbol}")
        
        if documents:
            try:
                self.stock_analysis.add(
                    documents=documents,
                    metadatas=metadatas,
                    ids=ids
                )
                logger.info(f"Added/Updated {len(documents)} stock analysis documents")
            except Exception as e:
                logger.error(f"Error adding stock data: {str(e)}")

    def add_fund_data(self, fund_data: Dict[str, Any]):
        """Add mutual fund data to collection"""
        if not fund_data:
            logger.warning("No fund data to add")
            return
            
        documents, metadatas, ids = [], [], []
        
        for fund_name, data in fund_data.items():
            
            # Determine suitability based on category and risk
            suitability = self.get_fund_suitability(data)
            
            fund_text = f"""Mutual Fund Analysis: {fund_name}

Fund Details:
Fund House: {data.get('fund_house', 'N/A')}
Category: {data['category']}
Risk Level: {data['risk_level']}
Minimum SIP Investment: ₹{data['min_investment']}

Performance Metrics:
1-Year Returns: {data['returns_1yr']}% annually
3-Year Returns: {data['returns_3yr']}% annually (annualized)
Expense Ratio: {data['expense_ratio']}% (annual management fee)

Investment Recommendation:
Suitable for: {suitability['target_investors']}
Investment Horizon: {suitability['time_horizon']}
Portfolio Allocation: {suitability['allocation_suggestion']}
Risk-Return Profile: {suitability['risk_return']}

Key Features:
{'✓ Tax benefits under Section 80C with 3-year lock-in' if data['category'] == 'ELSS' else ''}
{'✓ Professional fund management with active stock selection' if 'Index' not in data['category'] else '✓ Low-cost passive investing tracking market index'}
{'✓ Diversification across ' + data['category'].lower() + ' stocks' if data['category'] in ['Large Cap', 'Mid Cap', 'Small Cap'] else '✓ Balanced exposure to equity and debt'}
✓ SIP facility available for rupee cost averaging
✓ {'High liquidity - can be redeemed anytime' if data['category'] != 'ELSS' else 'Lock-in period of 3 years for tax benefits'}

SIP Strategy: Start with ₹{data['min_investment']}-{data['min_investment']*5} monthly SIP and increase by 10-15% annually for wealth creation.
"""
            
            documents.append(fund_text)
            metadatas.append({
                "fund_name": str(fund_name),
                "fund_house": str(data.get('fund_house', 'N/A')),
                "category": str(data['category']),
                "returns_1yr": str(data['returns_1yr']),
                "returns_3yr": str(data['returns_3yr']),
                "expense_ratio": str(data['expense_ratio']),
                "risk_level": str(data['risk_level']),
                "min_investment": str(data['min_investment']),
                "target_investors": str(suitability['target_investors'])
            })
            ids.append(f"fund_{hashlib.md5(fund_name.encode()).hexdigest()}")  # Consistent ID for funds
        
        if documents:
            try:
                self.investment_advice.add(
                    documents=documents,
                    metadatas=metadatas,
                    ids=ids
                )
                logger.info(f"Added/Updated {len(documents)} mutual fund analysis documents")
            except Exception as e:
                logger.error(f"Error adding fund data: {str(e)}")

    def get_fund_suitability(self, fund_data: Dict[str, Any]) -> Dict[str, str]:
        """Determine fund suitability based on characteristics"""
        category = fund_data['category']
        risk_level = fund_data['risk_level']
        
        suitability_matrix = {
            'Large Cap': {
                'target_investors': 'Conservative to moderate investors, beginners, those nearing retirement',
                'time_horizon': 'Minimum 5-7 years',
                'allocation_suggestion': '40-60% of equity portfolio',
                'risk_return': 'Lower risk with steady returns'
            },
            'Mid Cap': {
                'target_investors': 'Moderate to aggressive investors with higher risk tolerance',
                'time_horizon': 'Minimum 7-10 years',
                'allocation_suggestion': '20-30% of equity portfolio',
                'risk_return': 'Higher risk with potential for higher returns'
            },
            'Small Cap': {
                'target_investors': 'Aggressive investors comfortable with high volatility',
                'time_horizon': 'Minimum 10+ years',
                'allocation_suggestion': '10-20% of equity portfolio',
                'risk_return': 'High risk with highest return potential'
            },
            'ELSS': {
                'target_investors': 'Tax-saving investors seeking equity exposure',
                'time_horizon': '3+ years (lock-in) but preferably 7+ years',
                'allocation_suggestion': 'Up to ₹1.5 lakh annually under 80C',
                'risk_return': 'Moderate to high risk with tax benefits'
            },
            'Hybrid': {
                'target_investors': 'Conservative investors wanting balanced exposure',
                'time_horizon': 'Minimum 3-5 years',
                'allocation_suggestion': '20-40% of total portfolio',
                'risk_return': 'Moderate risk with balanced returns'
            },
            'Index Fund': {
                'target_investors': 'Cost-conscious investors preferring passive investing',
                'time_horizon': 'Minimum 10+ years for optimal results',
                'allocation_suggestion': '30-50% of equity portfolio',
                'risk_return': 'Market risk with market returns at low cost'
            }
        }
        
        return suitability_matrix.get(category, {
            'target_investors': 'Investors based on risk profile',
            'time_horizon': 'As per investment goals',
            'allocation_suggestion': 'As per risk tolerance',
            'risk_return': 'Returns commensurate with risk taken'
        })

def check_dependencies():
    """Check and report on required dependencies"""
    print("Checking dependencies...")
    
    dependencies_status = {
        "chromadb": True,  # Required - will fail if not present
        "pandas": HAS_PANDAS,
        "yfinance": HAS_YFINANCE,
        "crawl4ai": HAS_CRAWL4AI,
        "requests": HAS_REQUESTS,
        "textblob": HAS_TEXTBLOB
    }
    
    print("\nDependency Status:")
    for dep, status in dependencies_status.items():
        status_symbol = "✓" if status else "✗"
        print(f"  {status_symbol} {dep}")
    
    missing_deps = [dep for dep, status in dependencies_status.items() if not status]
    
    if missing_deps:
        print(f"\n⚠️  Missing optional dependencies: {', '.join(missing_deps)}")
        print("Install with: pip install " + " ".join(missing_deps))
        print("The system will work with reduced functionality using fallbacks.\n")
    else:
        print("\n✅ All dependencies available!\n")
    
    return len(missing_deps) == 0

async def main():
    """Main setup function with improved error handling"""
    print("=" * 60)
    print("CA FINANCIAL VOICE RAG AGENT - KNOWLEDGE BASE SETUP")
    print("=" * 60)
    
    # Check dependencies first
    all_deps_available = check_dependencies()
    
    try:
        kb = FinancialKnowledgeBase()
        
        print("Starting comprehensive financial knowledge base setup...")
        print("This will take several minutes to complete...")
        print()
        
        # Show progress
        print("📊 Step 1/4: Adding curated financial knowledge...")
        await kb.populate_knowledge_base()
        
        print("\n=" * 60)
        print("✅ KNOWLEDGE BASE SETUP COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print()
        print("Collections created:")
        print("✓ Financial Knowledge (general advice & strategies)")
        print("✓ Tax Rules (tax planning & regulations)")  
        print("✓ Investment Advice (mutual funds & SIPs)")
        print("✓ Stock Analysis (market data & recommendations)")
        print()
        
        # Show what data sources were integrated
        print("Data sources integrated:")
        print("✓ Comprehensive curated financial knowledge base")
        
        if HAS_YFINANCE:
            print("✓ Real-time Indian stock market data (via yfinance)")
        else:
            print("✓ Mock stock market data (yfinance not available)")
            
        print("✓ Popular mutual fund information and analysis")
        
        if HAS_CRAWL4AI:
            print("✓ Financial websites content (where accessible)")
        else:
            print("⚠️  Web crawling not available (crawl4ai not installed)")
        
        print()
        print("Knowledge base statistics:")
        
        # Get collection counts with error handling
        try:
            financial_count = kb.financial_knowledge.count()
            tax_count = kb.tax_rules.count()
            investment_count = kb.investment_advice.count()
            stock_count = kb.stock_analysis.count()
            
            print(f"✓ Financial Knowledge: {financial_count} documents")
            print(f"✓ Tax Rules: {tax_count} documents")
            print(f"✓ Investment Advice: {investment_count} documents")
            print(f"✓ Stock Analysis: {stock_count} documents")
            print(f"📊 Total: {financial_count + tax_count + investment_count + stock_count} documents")
        except Exception as e:
            print(f"⚠️ Error counting documents: {str(e)}")
            print("Run python check_chromadb.py to verify")
        
        print()
        print("Next steps:")
        print("1. Run: python app.py (start the voice agent)")
        print("2. For phone integration: python twilio_setup.py")
        print("3. Test interface: http://localhost:5000/test")
        print("4. Health check: http://localhost:5000/health")
        print()
        
        if not all_deps_available:
            print("⚠️  Note: Some optional dependencies are missing.")
            print("   The system will work but with limited features.")
            print("   Install missing packages with: pip install -r requirements.txt")
            print()
        
        print("🎉 Knowledge base is ready for the CA Voice RAG Agent!")
        
    except Exception as e:
        logger.error(f"Setup failed: {str(e)}")
        print(f"❌ Setup failed: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Ensure ChromaDB is properly installed: pip install chromadb")
        print("2. Check if you have write permissions in the current directory")
        print("3. Try installing missing dependencies: pip install -r requirements.txt")
        print("4. Check the logs in financial_agent.log for detailed error information")

if __name__ == "__main__":
    asyncio.run(main())