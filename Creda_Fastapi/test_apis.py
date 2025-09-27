#!/usr/bin/env python3
"""
Comprehensive API Testing Suite for FinVoice
Tests Finance API, Multilingual API, and Combined Workflows
Cross-platform compatible (Windows, Linux, macOS)
"""

import requests
import json
import time
import os
import sys
from typing import Dict, List, Any
from dataclasses import dataclass
from datetime import datetime

# ANSI color codes for cross-platform terminal colors
class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'
    
    @classmethod
    def disable_colors(cls):
        """Disable colors for Windows CMD compatibility"""
        cls.RED = cls.GREEN = cls.YELLOW = cls.BLUE = ''
        cls.MAGENTA = cls.CYAN = cls.WHITE = cls.BOLD = ''
        cls.UNDERLINE = cls.END = ''

# Disable colors on Windows CMD
if os.name == 'nt' and not os.environ.get('ANSICON'):
    Colors.disable_colors()

@dataclass
class TestResult:
    name: str
    status: str  # 'PASS', 'FAIL', 'SKIP'
    response_time: float
    status_code: int = None
    error: str = None
    response_data: Any = None

class APITester:
    def __init__(self, finance_url: str = "http://localhost:8001", multilingual_url: str = "http://localhost:8000"):
        self.finance_url = finance_url
        self.multilingual_url = multilingual_url
        self.results: List[TestResult] = []
        self.session = requests.Session()
        self.session.timeout = 30
        
    def print_header(self, text: str):
        """Print formatted header"""
        print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN}{text.center(60)}{Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}\n")
        
    def print_test_result(self, result: TestResult):
        """Print individual test result"""
        status_color = Colors.GREEN if result.status == 'PASS' else Colors.RED if result.status == 'FAIL' else Colors.YELLOW
        print(f"{status_color}[{result.status}]{Colors.END} {result.name}")
        
        if result.status_code:
            print(f"  └── Status: {result.status_code} | Time: {result.response_time:.3f}s")
            
        if result.error:
            print(f"  └── {Colors.RED}Error: {result.error}{Colors.END}")
            
        if result.response_data and result.status == 'PASS':
            if isinstance(result.response_data, dict):
                if 'status' in result.response_data:
                    print(f"  └── Response: {result.response_data.get('status', 'N/A')}")
                elif 'message' in result.response_data:
                    print(f"  └── Message: {result.response_data.get('message', 'N/A')[:100]}...")
        print()

    def test_api_call(self, name: str, method: str, url: str, expect_json: bool = True, **kwargs) -> TestResult:
        """Generic API test method"""
        start_time = time.time()
        try:
            response = self.session.request(method, url, **kwargs)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                if expect_json:
                    try:
                        data = response.json()
                        return TestResult(name, 'PASS', response_time, response.status_code, response_data=data)
                    except json.JSONDecodeError:
                        return TestResult(name, 'FAIL', response_time, response.status_code, 
                                        error="Invalid JSON response")
                else:
                    # For non-JSON responses (like audio files)
                    content_type = response.headers.get('content-type', '').lower()
                    content_length = len(response.content)
                    
                    if 'audio' in content_type or content_length > 1000:  # Audio files are typically larger
                        return TestResult(name, 'PASS', response_time, response.status_code, 
                                        response_data=f"Audio file received ({content_length} bytes, {content_type})")
                    else:
                        return TestResult(name, 'PASS', response_time, response.status_code, 
                                        response_data=f"Binary data received ({content_length} bytes)")
            else:
                error_msg = f"HTTP {response.status_code}"
                try:
                    error_data = response.json()
                    if 'detail' in error_data:
                        error_msg += f": {error_data['detail']}"
                except:
                    error_msg += f": {response.text[:200]}"
                    
                return TestResult(name, 'FAIL', response_time, response.status_code, error=error_msg)
                
        except requests.exceptions.ConnectionError:
            return TestResult(name, 'FAIL', time.time() - start_time, error="Connection refused - Service not running")
        except requests.exceptions.Timeout:
            return TestResult(name, 'FAIL', time.time() - start_time, error="Request timeout")
        except Exception as e:
            return TestResult(name, 'FAIL', time.time() - start_time, error=str(e))

    def test_finance_api(self):
        """Test all Finance API endpoints"""
        self.print_header("TESTING FINANCE API (Port 8001)")
        
        tests = [
            # Basic endpoints
            ("Finance Root", "GET", f"{self.finance_url}/"),
            ("Finance Health", "GET", f"{self.finance_url}/health"),
            ("Knowledge Base Stats", "GET", f"{self.finance_url}/knowledge_base_stats"),
            
            # Core functionality tests
            ("Process Finance Request", "POST", f"{self.finance_url}/process_request", {
                "json": {
                    "text": "What is emergency fund and how much should I save?",
                    "intent": "financial_advice",
                    "entities": {"topic": "emergency_fund", "amount_type": "recommendation"},
                    "user_language": "english"
                }
            }),
            
            ("Portfolio Allocation", "POST", f"{self.finance_url}/get_portfolio_allocation", {
                "json": {
                    "age": 30,
                    "income": 800000,
                    "savings": 200000,
                    "risk_tolerance": 3,
                    "dependents": 0,
                    "goal_type": "retirement",
                    "time_horizon": 25
                }
            }),
            
            ("Budget Optimization", "POST", f"{self.finance_url}/optimize_budget", {
                "json": {
                    "income": 100000,
                    "expenses": [
                        {"amount": 30000, "category": "Housing", "date": "2024-01-15"},
                        {"amount": 15000, "category": "Food & Dining", "date": "2024-01-15"},
                        {"amount": 10000, "category": "Transportation", "date": "2024-01-16"}
                    ]
                }
            }),
            
            ("Portfolio Rebalancing Check", "POST", f"{self.finance_url}/check_rebalancing", {
                "json": {
                    "profile": {
                        "age": 35,
                        "income": 1200000,
                        "savings": 500000,
                        "risk_tolerance": 4,
                        "dependents": 1
                    },
                    "current_allocation": {
                        "equity": 65,
                        "debt": 25,
                        "cash": 10
                    },
                    "threshold": 0.05
                }
            }),
            
            ("Financial Health Score", "POST", f"{self.finance_url}/calculate_health_score", {
                "json": {
                    "profile": {
                        "age": 28,
                        "income": 900000,
                        "savings": 300000,
                        "risk_tolerance": 3,
                        "dependents": 0
                    },
                    "expenses": [
                        {"amount": 25000, "category": "Housing"},
                        {"amount": 12000, "category": "Food & Dining"},
                        {"amount": 8000, "category": "Transportation"}
                    ]
                }
            }),
            
            ("Detect Spending Anomalies", "POST", f"{self.finance_url}/detect_anomalies", {
                "json": [
                    {"amount": 25000, "category": "Housing", "date": "2024-01-15"},
                    {"amount": 12000, "category": "Food & Dining", "date": "2024-01-16"},
                    {"amount": 50000, "category": "Food & Dining", "date": "2024-01-17"},  # Anomaly
                    {"amount": 8000, "category": "Transportation", "date": "2024-01-18"}
                ]
            }),
            
            ("RAG Query", "POST", f"{self.finance_url}/rag_query", {
                "params": {"query": "What are the tax benefits of ELSS mutual funds?"}
            }),
            
            ("Comprehensive Portfolio Optimization", "POST", f"{self.finance_url}/portfolio_optimization", {
                "json": {
                    "profile": {
                        "age": 32,
                        "income": 1500000,
                        "savings": 800000,
                        "risk_tolerance": 4,
                        "dependents": 1
                    },
                    "current_portfolio": {
                        "equity_mutual_funds": {"value": 400000, "percentage": 50},
                        "debt_mutual_funds": {"value": 200000, "percentage": 25},
                        "cash": {"value": 200000, "percentage": 25}
                    },
                    "goals": ["retirement", "child_education"],
                    "time_horizon_years": 15
                }
            })
        ]
        
        for test_item in tests:
            if len(test_item) == 4:
                test_name, method, url, kwargs = test_item
                expect_json = True
            elif len(test_item) == 5:
                test_name, method, url, kwargs, expect_json = test_item
            else:
                test_name, method, url = test_item[:3]
                kwargs = {}
                expect_json = True
            
            result = self.test_api_call(test_name, method, url, expect_json, **kwargs)
            self.results.append(result)
            self.print_test_result(result)

    def test_multilingual_api(self):
        """Test Multilingual API endpoints"""
        self.print_header("TESTING MULTILINGUAL API (Port 8000)")
        
        tests = [
            ("Multilingual Root", "GET", f"{self.multilingual_url}/"),
            ("Multilingual Health", "GET", f"{self.multilingual_url}/health"),
            ("ASR Model Test", "POST", f"{self.multilingual_url}/test_asr"),
            
            # Core functionality tests
            ("Text Translation (Hindi)", "POST", f"{self.multilingual_url}/translate", {
                "params": {
                    "text": "What is mutual fund?",
                    "source_language": "english", 
                    "target_language": "hindi"
                }
            }),
            
            ("Text Translation (English)", "POST", f"{self.multilingual_url}/translate", {
                "params": {
                    "text": "म्यूचुअल फंड क्या है?",
                    "source_language": "hindi", 
                    "target_language": "english"
                }
            }),
            
            ("Intent Understanding", "POST", f"{self.multilingual_url}/understand_intent", {
                "params": {
                    "text": "I want to invest 50000 rupees in mutual funds for retirement"
                }
            }),
            
            ("Audio Response Generation", "POST", f"{self.multilingual_url}/get_audio_response", {
                "json": {
                    "text": "Your portfolio allocation has been optimized for maximum returns with moderate risk.",
                    "target_language": "english"
                }
            }, False),  # Expect audio file, not JSON
            
            ("Multilingual Query Round-trip", "POST", f"{self.multilingual_url}/process_multilingual_query", {
                "json": {
                    "text": "SIP क्या है?",
                    "auto_detect": True
                }
            })
        ]
        
        for test_item in tests:
            if len(test_item) == 4:
                test_name, method, url, kwargs = test_item
                expect_json = True
            elif len(test_item) == 5:
                test_name, method, url, kwargs, expect_json = test_item
            else:
                test_name, method, url = test_item[:3]
                kwargs = {}
                expect_json = True
            
            result = self.test_api_call(test_name, method, url, expect_json, **kwargs)
            self.results.append(result)
            self.print_test_result(result)

    def test_combined_workflow(self):
        """Test combined multilingual + finance workflows"""
        self.print_header("TESTING COMBINED WORKFLOWS")
        
        # Test 1: Hindi Investment Planning Workflow
        print(f"{Colors.BOLD}{Colors.BLUE}Test Scenario 1: Hindi Investment Planning → Portfolio + Audio{Colors.END}")
        
        # Step 1: Translate Hindi investment query
        hindi_translate_result = self.test_api_call(
            "ML: Translate Hindi Investment Query", "POST", f"{self.multilingual_url}/translate",
            params={
                "text": "मैं 30 साल का हूं और रिटायरमेंट के लिए 5 लाख रुपए निवेश करना चाहता हूं",
                "source_language": "hindi",
                "target_language": "english"
            }
        )
        self.results.append(hindi_translate_result)
        self.print_test_result(hindi_translate_result)
        
        # Step 2: Get portfolio allocation based on translated query
        if hindi_translate_result.status == 'PASS':
            portfolio_result = self.test_api_call(
                "Finance: Portfolio for 30yr Hindi User", "POST", f"{self.finance_url}/get_portfolio_allocation",
                json={
                    "age": 30,
                    "income": 1200000,
                    "savings": 500000,
                    "risk_tolerance": 3,
                    "dependents": 0,
                    "goal_type": "retirement",
                    "time_horizon": 25
                }
            )
            self.results.append(portfolio_result)
            self.print_test_result(portfolio_result)
            
            # Step 3: Generate Hindi audio response
            if portfolio_result.status == 'PASS':
                hindi_audio_result = self.test_api_call(
                    "ML: Generate Hindi Audio Response", "POST", f"{self.multilingual_url}/get_audio_response",
                    expect_json=False,
                    json={
                        "text": "आपके रिटायरमेंट के लिए पोर्टफोलियो तैयार कर दिया गया है। 60% इक्विटी और 40% डेब्ट का मिश्रण सबसे अच्छा होगा।",
                        "target_language": "hindi"
                    }
                )
                self.results.append(hindi_audio_result)
                self.print_test_result(hindi_audio_result)
        
        print()
        
        # Test 2: Marathi Tax Planning with Automatic Language Round-trip
        print(f"{Colors.BOLD}{Colors.BLUE}Test Scenario 2: Marathi Tax Query → Complete Round-trip{Colors.END}")
        
        # Step 1: Use new multilingual query endpoint for automatic round-trip
        marathi_roundtrip_result = self.test_api_call(
            "ML: Marathi Tax Query Complete Round-trip", "POST", f"{self.multilingual_url}/process_multilingual_query",
            json={
                "text": "ELSS म्युच्युअल फंडामध्ये गुंतवणूक केल्याने कर सवलत मिळते का?",
                "auto_detect": True
            }
        )
        self.results.append(marathi_roundtrip_result)
        self.print_test_result(marathi_roundtrip_result)
        
        # Step 2: Manual workflow for comparison (old method)
        marathi_translate_result = self.test_api_call(
            "ML: Manual Marathi Translation", "POST", f"{self.multilingual_url}/translate",
            params={
                "text": "ELSS म्युच्युअल फंडामध्ये गुंतवणूक केल्याने कर सवलत मिळते का?",
                "source_language": "marathi", 
                "target_language": "english"
            }
        )
        self.results.append(marathi_translate_result)
        self.print_test_result(marathi_translate_result)
        
        # Step 3: RAG query for comparison
        if marathi_translate_result.status == 'PASS':
            tax_rag_result = self.test_api_call(
                "Finance: RAG Query ELSS Tax Benefits", "POST", f"{self.finance_url}/rag_query",
                params={"query": "ELSS mutual funds tax benefits Section 80C deduction limits Indian taxation"}
            )
            self.results.append(tax_rag_result)
            self.print_test_result(tax_rag_result)

        print()
        
        # Test 3: Hindi SIP Planning with Complete Round-trip
        print(f"{Colors.BOLD}{Colors.BLUE}Test Scenario 3: Hindi SIP Planning → Complete Round-trip{Colors.END}")
        
        # Step 1: Use new multilingual endpoint for automatic Hindi round-trip
        hindi_sip_roundtrip_result = self.test_api_call(
            "ML: Hindi SIP Query Complete Round-trip", "POST", f"{self.multilingual_url}/process_multilingual_query",
            json={
                "text": "मैं हर महीने 10000 रुपए का SIP करना चाहता हूं",
                "auto_detect": True
            }
        )
        self.results.append(hindi_sip_roundtrip_result)
        self.print_test_result(hindi_sip_roundtrip_result)
        
        # Step 2: Compare with manual intent extraction
        hindi_intent_result = self.test_api_call(
            "ML: Manual Hindi SIP Intent", "POST", f"{self.multilingual_url}/understand_intent",
            params={"text": "मैं हर महीने 10000 रुपए का SIP करना चाहता हूं"}
        )
        self.results.append(hindi_intent_result)
        self.print_test_result(hindi_intent_result)
        
        # Step 2: Process SIP planning request
        if hindi_intent_result.status == 'PASS':
            sip_request_result = self.test_api_call(
                "Finance: Process SIP Planning Request", "POST", f"{self.finance_url}/process_request",
                json={
                    "text": "I want to start SIP of 10000 rupees monthly for wealth creation",
                    "intent": "investment_planning",
                    "entities": {"amount": 10000, "frequency": "monthly", "goal": "wealth_creation", "language": "hindi"},
                    "user_language": "english"
                }
            )
            self.results.append(sip_request_result)
            self.print_test_result(sip_request_result)
            
            # Step 3: Optimize budget for SIP
            if sip_request_result.status == 'PASS':
                sip_budget_result = self.test_api_call(
                    "Finance: Budget for SIP Planning", "POST", f"{self.finance_url}/optimize_budget",
                    json={
                        "income": 80000,
                        "expenses": [
                            {"amount": 25000, "category": "Housing", "date": "2024-01-15"},
                            {"amount": 15000, "category": "Food & Dining", "date": "2024-01-15"},
                            {"amount": 10000, "category": "Transportation", "date": "2024-01-16"},
                            {"amount": 10000, "category": "SIP Investment", "date": "2024-01-17"}
                        ]
                    }
                )
                self.results.append(sip_budget_result)
                self.print_test_result(sip_budget_result)

        print()
        
        # Test 4: Marathi Emergency Fund Workflow
        print(f"{Colors.BOLD}{Colors.BLUE}Test Scenario 4: Marathi Emergency Fund → Health Score → Audio{Colors.END}")
        
        # Step 1: Translate Marathi emergency fund query
        marathi_emergency_result = self.test_api_call(
            "ML: Translate Marathi Emergency Query", "POST", f"{self.multilingual_url}/translate",
            params={
                "text": "आपत्कालीन निधीसाठी किती पैसे ठेवावे लागतील?",
                "source_language": "marathi",
                "target_language": "english"
            }
        )
        self.results.append(marathi_emergency_result)
        self.print_test_result(marathi_emergency_result)
        
        # Step 2: Calculate financial health score
        if marathi_emergency_result.status == 'PASS':
            health_score_result = self.test_api_call(
                "Finance: Calculate Financial Health", "POST", f"{self.finance_url}/calculate_health_score",
                json={
                    "profile": {
                        "age": 28,
                        "income": 800000,
                        "savings": 100000,
                        "risk_tolerance": 2,
                        "dependents": 1
                    },
                    "expenses": [
                        {"amount": 25000, "category": "Housing"},
                        {"amount": 15000, "category": "Food & Dining"},
                        {"amount": 8000, "category": "Transportation"},
                        {"amount": 5000, "category": "Utilities"}
                    ]
                }
            )
            self.results.append(health_score_result)
            self.print_test_result(health_score_result)
            
            # Step 3: Generate Marathi audio response
            if health_score_result.status == 'PASS':
                marathi_audio_result = self.test_api_call(
                    "ML: Generate Marathi Audio Response", "POST", f"{self.multilingual_url}/get_audio_response",
                    expect_json=False,
                    json={
                        "text": "तुमच्या आर्थिक आरोग्याचे मूल्यांकन पूर्ण झाले आहे. आपत्कालीन निधीसाठी 6 महिन्यांचा खर्च ठेवणे योग्य आहे.",
                        "target_language": "marathi"
                    }
                )
                self.results.append(marathi_audio_result)
                self.print_test_result(marathi_audio_result)

        print()
        
        # Test 5: Mixed Language Investment Comparison
        print(f"{Colors.BOLD}{Colors.BLUE}Test Scenario 5: Mixed Language Investment Planning{Colors.END}")
        
        # Step 1: Hindi large cap vs small cap query
        hindi_comparison_result = self.test_api_call(
            "ML: Translate Hindi Fund Comparison", "POST", f"{self.multilingual_url}/translate",
            params={
                "text": "लार्ज कैप और स्मॉल कैप फंड में क्या अंतर है?",
                "source_language": "hindi",
                "target_language": "english"
            }
        )
        self.results.append(hindi_comparison_result)
        self.print_test_result(hindi_comparison_result)
        
        # Step 2: Get comprehensive portfolio optimization
        if hindi_comparison_result.status == 'PASS':
            comprehensive_portfolio_result = self.test_api_call(
                "Finance: Comprehensive Portfolio Analysis", "POST", f"{self.finance_url}/portfolio_optimization",
                json={
                    "profile": {
                        "age": 35,
                        "income": 1500000,
                        "savings": 700000,
                        "risk_tolerance": 4,
                        "dependents": 2
                    },
                    "current_portfolio": {
                        "large_cap_equity": {"value": 350000, "percentage": 50},
                        "small_cap_equity": {"value": 175000, "percentage": 25},
                        "debt_funds": {"value": 175000, "percentage": 25}
                    },
                    "goals": ["retirement", "child_education"],
                    "time_horizon_years": 20
                }
            )
            self.results.append(comprehensive_portfolio_result)
            self.print_test_result(comprehensive_portfolio_result)

    def generate_summary(self):
        """Generate test summary"""
        self.print_header("TEST SUMMARY")
        
        total_tests = len(self.results)
        passed = len([r for r in self.results if r.status == 'PASS'])
        failed = len([r for r in self.results if r.status == 'FAIL'])
        skipped = len([r for r in self.results if r.status == 'SKIP'])
        
        print(f"{Colors.BOLD}Total Tests: {total_tests}{Colors.END}")
        print(f"{Colors.GREEN}✅ Passed: {passed}{Colors.END}")
        print(f"{Colors.RED}❌ Failed: {failed}{Colors.END}")
        print(f"{Colors.YELLOW}⏭️  Skipped: {skipped}{Colors.END}")
        print(f"{Colors.BOLD}Success Rate: {(passed/total_tests)*100:.1f}%{Colors.END}")
        
        # Average response times
        successful_tests = [r for r in self.results if r.status == 'PASS']
        if successful_tests:
            avg_time = sum(r.response_time for r in successful_tests) / len(successful_tests)
            print(f"{Colors.CYAN}Average Response Time: {avg_time:.3f}s{Colors.END}")
        
        # Failed tests details
        if failed > 0:
            print(f"\n{Colors.RED}{Colors.BOLD}FAILED TESTS:{Colors.END}")
            for result in self.results:
                if result.status == 'FAIL':
                    print(f"{Colors.RED}• {result.name}: {result.error}{Colors.END}")

    def save_report(self, filename: str = None):
        """Save detailed test report to file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"api_test_report_{timestamp}.json"
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "finance_url": self.finance_url,
            "multilingual_url": self.multilingual_url,
            "summary": {
                "total_tests": len(self.results),
                "passed": len([r for r in self.results if r.status == 'PASS']),
                "failed": len([r for r in self.results if r.status == 'FAIL']),
                "skipped": len([r for r in self.results if r.status == 'SKIP'])
            },
            "results": [
                {
                    "name": r.name,
                    "status": r.status,
                    "response_time": r.response_time,
                    "status_code": r.status_code,
                    "error": r.error,
                    "response_data": r.response_data
                }
                for r in self.results
            ]
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
            
        print(f"\n{Colors.GREEN}📄 Detailed report saved: {filename}{Colors.END}")

def main():
    """Main test execution"""
    print(f"{Colors.BOLD}{Colors.MAGENTA}")
    print("🚀 FinVoice API Test Suite")
    print("Cross-platform API Testing Tool")
    print(f"Python {sys.version.split()[0]} | Platform: {sys.platform}")
    print(f"{Colors.END}")
    
    # Initialize tester
    tester = APITester()
    
    # Check if services are running
    print(f"{Colors.CYAN}🔍 Checking service availability...{Colors.END}")
    
    try:
        finance_check = requests.get(f"{tester.finance_url}/health", timeout=5)
        finance_status = "🟢 Online" if finance_check.status_code == 200 else "🟡 Issues"
    except:
        finance_status = "🔴 Offline"
        
    try:
        ml_check = requests.get(f"{tester.multilingual_url}/health", timeout=5)
        ml_status = "🟢 Online" if ml_check.status_code == 200 else "🟡 Issues"
    except:
        ml_status = "🔴 Offline"
    
    print(f"Finance API (8001): {finance_status}")
    print(f"Multilingual API (8000): {ml_status}")
    
    # Run tests
    start_time = time.time()
    
    # Test individual APIs
    tester.test_finance_api()
    tester.test_multilingual_api()
    
    # Test combined workflows
    tester.test_combined_workflow()
    
    # Generate results
    total_time = time.time() - start_time
    tester.generate_summary()
    
    print(f"\n{Colors.CYAN}⏱️  Total execution time: {total_time:.2f} seconds{Colors.END}")
    
    # Save report
    tester.save_report()
    
    # Exit with appropriate code
    failed_tests = len([r for r in tester.results if r.status == 'FAIL'])
    sys.exit(failed_tests)

if __name__ == "__main__":
    main()