// import { supabase } from './config';
// Göstermelik veriler kullanılacak, gerçek Supabase bağlantısı yok

// İngilizce kelime bilgisi arayüzü
export interface EnglishWordInfo {
  id: string;
  word: string;
  phonetic?: string;
  audio_url?: string;
  meanings: {
    part_of_speech: string;
    definition: string;
    example?: string;
    synonyms?: string[];
    antonyms?: string[];
  }[];
  created_at: string;
  updated_at: string;
}

// İngilizce kelime bilgisi getir - Göstermelik ve API
export const getEnglishWordInfo = async (word: string): Promise<EnglishWordInfo | null> => {
  try {
    // Önce göstermelik verilerde kontrol et
    const mockWords: Record<string, EnglishWordInfo> = {
      'apple': {
        id: 'mock-english-1',
        word: 'apple',
        phonetic: '/æpəl/',
        audio_url: 'https://api.dictionaryapi.dev/media/pronunciations/en/apple-us.mp3',
        meanings: [
          {
            part_of_speech: 'noun',
            definition: 'A common, round fruit produced by the tree Malus domestica, cultivated in temperate climates.',
            example: 'I ate an apple for breakfast.',
            synonyms: [],
            antonyms: []
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'car': {
        id: 'mock-english-2',
        word: 'car',
        phonetic: '/kɑr/',
        audio_url: 'https://api.dictionaryapi.dev/media/pronunciations/en/car-us.mp3',
        meanings: [
          {
            part_of_speech: 'noun',
            definition: 'A vehicle that moves independently, steered by a driver primarily for personal transportation.',
            example: 'She drove her car to the mall.',
            synonyms: ['automobile', 'vehicle', 'motor'],
            antonyms: []
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      'book': {
        id: 'mock-english-3',
        word: 'book',
        phonetic: '/bʊk/',
        audio_url: 'https://api.dictionaryapi.dev/media/pronunciations/en/book-us.mp3',
        meanings: [
          {
            part_of_speech: 'noun',
            definition: 'A collection of sheets of paper bound together to hinge at one edge, containing printed or written material, pictures, etc.',
            example: 'I read a book about dinosaurs.',
            synonyms: ['tome', 'volume'],
            antonyms: []
          },
          {
            part_of_speech: 'verb',
            definition: 'To reserve (something) for future use.',
            example: 'I booked a hotel room for our vacation.',
            synonyms: ['reserve', 'schedule'],
            antonyms: ['cancel']
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };

    // Göstermelik verilerde varsa döndür
    const lowerWord = word.toLowerCase();
    if (mockWords[lowerWord]) {
      return mockWords[lowerWord];
    }

    // Göstermelik verilerde yoksa, Dictionary API'den al
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(lowerWord)}`);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Kelime bulunamadı:', word);
          return null;
        }
        throw new Error(`API hatası: ${response.status}`);
      }

      const apiData = await response.json();

      if (!apiData || !apiData[0]) {
        return null;
      }

      // API'den gelen veriyi formatlayalım
      const wordData = apiData[0];

      const meanings = wordData.meanings.map((meaning: any) => ({
        part_of_speech: meaning.partOfSpeech,
        definition: meaning.definitions[0]?.definition || '',
        example: meaning.definitions[0]?.example || '',
        synonyms: meaning.synonyms || [],
        antonyms: meaning.antonyms || [],
      }));

      // Ses dosyası URL'sini alalım
      let audioUrl = '';
      if (wordData.phonetics && wordData.phonetics.length > 0) {
        for (const phonetic of wordData.phonetics) {
          if (phonetic.audio) {
            audioUrl = phonetic.audio;
            break;
          }
        }
      }

      // Göstermelik bir ID ile döndür
      return {
        id: 'api-' + Date.now(),
        word: lowerWord,
        phonetic: wordData.phonetic || '',
        audio_url: audioUrl,
        meanings: meanings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (apiError) {
      console.error('API hatası:', apiError);
      return null;
    }
  } catch (error: any) {
    console.error('İngilizce kelime bilgisi alınırken hata:', error.message);
    throw error;
  }
};

// Kullanıcının öğrendiği kelimeleri kaydet - Göstermelik
export const saveLearnedWord = async (userId: string, wordId: string, confidence: number): Promise<void> => {
  try {
    console.log(`Göstermelik öğrenilen kelime kaydedildi: ${wordId}, güven: ${confidence}`);
    // Göstermelik olduğu için herhangi bir işlem yapmıyoruz
  } catch (error: any) {
    console.error('Öğrenilen kelime kaydedilirken hata:', error.message);
    throw error;
  }
};

// Kullanıcının öğrendiği kelimeleri getir - Göstermelik
export const getLearnedWords = async (userId: string): Promise<any[]> => {
  try {
    // Göstermelik öğrenilen kelimeler
    return [
      {
        id: 'learned-1',
        user_id: userId,
        word_id: 'mock-english-1',
        confidence: 80,
        last_reviewed: new Date().toISOString(),
        english_words: {
          id: 'mock-english-1',
          word: 'apple',
          phonetic: '/æpəl/',
          audio_url: 'https://api.dictionaryapi.dev/media/pronunciations/en/apple-us.mp3',
          meanings: [
            {
              part_of_speech: 'noun',
              definition: 'A common, round fruit produced by the tree Malus domestica, cultivated in temperate climates.',
              example: 'I ate an apple for breakfast.',
              synonyms: [],
              antonyms: []
            }
          ]
        }
      },
      {
        id: 'learned-2',
        user_id: userId,
        word_id: 'mock-english-2',
        confidence: 60,
        last_reviewed: new Date(Date.now() - 86400000).toISOString(), // 1 gün önce
        english_words: {
          id: 'mock-english-2',
          word: 'car',
          phonetic: '/kɑr/',
          audio_url: 'https://api.dictionaryapi.dev/media/pronunciations/en/car-us.mp3',
          meanings: [
            {
              part_of_speech: 'noun',
              definition: 'A vehicle that moves independently, steered by a driver primarily for personal transportation.',
              example: 'She drove her car to the mall.',
              synonyms: ['automobile', 'vehicle', 'motor'],
              antonyms: []
            }
          ]
        }
      }
    ];
  } catch (error: any) {
    console.error('Öğrenilen kelimeler alınırken hata:', error.message);
    throw error;
  }
};

// Kullanıcıya önerilecek kelimeleri getir - Göstermelik
export const getSuggestedWords = async (userId: string, limit: number = 10): Promise<EnglishWordInfo[]> => {
  try {
    // Göstermelik önerilen kelimeler
    return [
      {
        id: 'suggested-1',
        word: 'hello',
        phonetic: '/həˈloʊ/',
        audio_url: 'https://api.dictionaryapi.dev/media/pronunciations/en/hello-us.mp3',
        meanings: [
          {
            part_of_speech: 'noun',
            definition: 'An utterance of "hello"; a greeting.',
            example: 'She gave me a warm hello.',
            synonyms: ['greeting'],
            antonyms: []
          },
          {
            part_of_speech: 'interjection',
            definition: 'A greeting used when meeting someone or acknowledging someone\'s arrival or presence.',
            example: 'Hello, how are you today?',
            synonyms: ['hi', 'hey'],
            antonyms: ['goodbye']
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'suggested-2',
        word: 'world',
        phonetic: '/wɜrld/',
        audio_url: 'https://api.dictionaryapi.dev/media/pronunciations/en/world-us.mp3',
        meanings: [
          {
            part_of_speech: 'noun',
            definition: 'The Earth, especially the surface of the Earth or some other planet.',
            example: 'People all over the world are suffering from hunger.',
            synonyms: ['Earth', 'globe'],
            antonyms: []
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'suggested-3',
        word: 'computer',
        phonetic: '/kəmˈpjuːtər/',
        audio_url: 'https://api.dictionaryapi.dev/media/pronunciations/en/computer-us.mp3',
        meanings: [
          {
            part_of_speech: 'noun',
            definition: 'A programmable electronic device designed to accept data, perform prescribed mathematical and logical operations at high speed, and display the results of these operations.',
            example: 'I need to buy a new computer.',
            synonyms: ['PC', 'laptop'],
            antonyms: []
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ].slice(0, limit);
  } catch (error: any) {
    console.error('Önerilen kelimeler alınırken hata:', error.message);
    throw error;
  }
};

// Kelime tekrarı için kelimeleri getir - Göstermelik
export const getWordsForReview = async (userId: string, limit: number = 10): Promise<any[]> => {
  try {
    // Göstermelik tekrar kelimeleri
    return [
      {
        id: 'review-1',
        user_id: userId,
        word_id: 'mock-english-3',
        confidence: 40,
        last_reviewed: new Date(Date.now() - 172800000).toISOString(), // 2 gün önce
        english_words: {
          id: 'mock-english-3',
          word: 'book',
          phonetic: '/bʊk/',
          audio_url: 'https://api.dictionaryapi.dev/media/pronunciations/en/book-us.mp3',
          meanings: [
            {
              part_of_speech: 'noun',
              definition: 'A collection of sheets of paper bound together to hinge at one edge, containing printed or written material, pictures, etc.',
              example: 'I read a book about dinosaurs.',
              synonyms: ['tome', 'volume'],
              antonyms: []
            },
            {
              part_of_speech: 'verb',
              definition: 'To reserve (something) for future use.',
              example: 'I booked a hotel room for our vacation.',
              synonyms: ['reserve', 'schedule'],
              antonyms: ['cancel']
            }
          ]
        }
      },
      {
        id: 'review-2',
        user_id: userId,
        word_id: 'mock-english-4',
        confidence: 30,
        last_reviewed: new Date(Date.now() - 259200000).toISOString(), // 3 gün önce
        english_words: {
          id: 'mock-english-4',
          word: 'phone',
          phonetic: '/foʊn/',
          audio_url: 'https://api.dictionaryapi.dev/media/pronunciations/en/phone-us.mp3',
          meanings: [
            {
              part_of_speech: 'noun',
              definition: 'A device used for communication through telephone lines, typically having a handset or headset.',
              example: 'I need to charge my phone.',
              synonyms: ['telephone', 'mobile', 'cell phone'],
              antonyms: []
            },
            {
              part_of_speech: 'verb',
              definition: 'To call someone using a phone.',
              example: 'I phoned my mother yesterday.',
              synonyms: ['call', 'telephone'],
              antonyms: []
            }
          ]
        }
      }
    ].slice(0, limit);
  } catch (error: any) {
    console.error('Tekrar kelimeleri alınırken hata:', error.message);
    throw error;
  }
};
