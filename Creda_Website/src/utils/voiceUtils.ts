// Voice utilities for better reliability and cross-browser support
export class VoiceUtils {
  // Check if speech recognition is supported
  static isSpeechRecognitionSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  // Check if speech synthesis is supported
  static isSpeechSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  // Get the appropriate SpeechRecognition constructor
  static getSpeechRecognition(): any | null {
    if ('webkitSpeechRecognition' in window) {
      return (window as any).webkitSpeechRecognition;
    }
    if ('SpeechRecognition' in window) {
      return (window as any).SpeechRecognition;
    }
    return null;
  }

  // Normalize confidence values
  static normalizeConfidence(confidence: number): number {
    return Math.max(0, Math.min(1, confidence));
  }

  // Simple fuzzy string matching for wake word detection
  static fuzzyMatch(text1: string, text2: string, threshold: number = 0.75): boolean {
    if (text1.length === 0) return text2.length === 0;
    if (text2.length === 0) return false;

    const matrix: number[][] = [];
    
    // Initialize matrix
    for (let i = 0; i <= text2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= text1.length; j++) {
      matrix[0][j] = j;
    }

    // Calculate edit distance
    for (let i = 1; i <= text2.length; i++) {
      for (let j = 1; j <= text1.length; j++) {
        if (text2.charAt(i - 1) === text1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    const maxLen = Math.max(text1.length, text2.length);
    const similarity = (maxLen - matrix[text2.length][text1.length]) / maxLen;
    return similarity >= threshold;
  }

  // Clean and normalize transcript text
  static cleanTranscript(transcript: string): string {
    // Keep Unicode letters and numbers across languages (use Unicode property escapes)
    // Remove punctuation but preserve letters/numbers/whitespace from all scripts.
    // Note: RegExp with \p requires the 'u' flag.
    // Normalize and remove punctuation while keeping Unicode letters/numbers/whitespace.
    // The previous character class contained an extra '^' which made the intent ambiguous
    // — use a clean negated class to remove anything that's not a letter, number or whitespace.
    return transcript
      .toLowerCase()
      .trim()
        .replace(/[^\p{L}\p{N}\s]+/gu, '') // remove any char that's not a Unicode letter, number, or whitespace
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  // Detect wake words with fuzzy matching
  static detectWakeWord(transcript: string, wakeWords: string[]): boolean {
    const cleanText = this.cleanTranscript(transcript);

    // Tokenize the transcript so we can do token-level fuzzy matching. This helps
    // detect short wake-words insidee longer transcripts and improves reliability
    // across languages and recognition inconsistencies.
    const tokens = cleanText.split(/\s+/).filter(Boolean);

    return wakeWords.some(word => {
      const cleanWord = this.cleanTranscript(word);
      if (!cleanWord) return false;

      // Exact substring match is the cheapest and most reliable.
      if (cleanText.includes(cleanWord)) return true;

      // If the wake word is multiple tokens, attempt to match contiguous windows
      // of tokens from the transcript using fuzzy matching.
      const wordTokens = cleanWord.split(/\s+/).filter(Boolean);
      const maxWindow = Math.max(1, wordTokens.length);

      for (let size = 1; size <= maxWindow; size++) {
        for (let i = 0; i + size <= tokens.length; i++) {
          const window = tokens.slice(i, i + size).join(' ');
          if (this.fuzzyMatch(window, cleanWord, 0.72)) {
            return true;
          }
        }
      }

      // Fallback: try fuzzy match against the whole transcript (lower precedence)
      return this.fuzzyMatch(cleanText, cleanWord, 0.70);
    });
  }

  // Create audio response using Web Speech API
  static async speakText(text: string, options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    lang?: string;
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSpeechSynthesisSupported()) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 0.8;
      utterance.lang = options.lang || 'en-US';

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(event.error));

      speechSynthesis.speak(utterance);
    });
  }

  // Get available voices for speech synthesis
  static getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.isSpeechSynthesisSupported()) {
      return [];
    }
    return speechSynthesis.getVoices();
  }

  // Get preferred voice for a language
  static getPreferredVoice(lang: string): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    
    // Try to find a voice that matches the language
    const matchingVoice = voices.find(voice => 
      voice.lang.toLowerCase().startsWith(lang.toLowerCase())
    );
    
    if (matchingVoice) return matchingVoice;
    
    // Fallback to default voice
    const defaultVoice = voices.find(voice => voice.default);
    return defaultVoice || voices[0] || null;
  }

  // Request microphone permission with user-friendly error handling
  static async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.warn('Microphone permission denied:', error);
      return false;
    }
  }

  // Format time for voice responses
  static formatTimeForSpeech(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${ampm}`;
  }

  // Format currency for voice responses
  static formatCurrencyForSpeech(amount: number, currency: string = 'USD'): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    
    return formatter.format(amount).replace('$', 'dollars ');
  }

  // Debounce function for preventing multiple rapid calls
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  }

  // Simple retry mechanism for unstable operations
  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError!;
  }
}