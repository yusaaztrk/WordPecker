// import { supabase } from './config';
// Göstermelik veriler kullanılacak, gerçek Supabase bağlantısı yok

// Konum tabanlı kelime arayüzü
export interface LocationWord {
  id: string;
  place_type: string;
  turkish_name: string;
  english_name: string;
  description?: string;
  example_sentence?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

// Konum tabanlı kelime getir - Göstermelik
export const getLocationWords = async (placeType: string): Promise<LocationWord[]> => {
  try {
    // Göstermelik konum kelimeleri
    const mockLocationWords: Record<string, LocationWord[]> = {
      'restaurant': [
        {
          id: 'loc-1',
          place_type: 'restaurant',
          turkish_name: 'Restoran',
          english_name: 'Restaurant',
          description: 'Yemek yiyebileceğiniz bir yer',
          example_sentence: "Let's go to a restaurant for dinner.",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'loc-2',
          place_type: 'restaurant',
          turkish_name: 'Kafe',
          english_name: 'Cafe',
          description: 'Kahve ve atıştırmalıklar sunan bir yer',
          example_sentence: "I like to work at a cafe in the morning.",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      'hospital': [
        {
          id: 'loc-3',
          place_type: 'hospital',
          turkish_name: 'Hastane',
          english_name: 'Hospital',
          description: 'Sağlık hizmetleri sunan bir yer',
          example_sentence: "My friend is in the hospital recovering from surgery.",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      'school': [
        {
          id: 'loc-4',
          place_type: 'school',
          turkish_name: 'Okul',
          english_name: 'School',
          description: 'Eğitim verilen bir yer',
          example_sentence: "My children go to school every weekday.",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      'supermarket': [
        {
          id: 'loc-5',
          place_type: 'supermarket',
          turkish_name: 'Süpermarket',
          english_name: 'Supermarket',
          description: 'Gıda ve diğer ürünleri alabileceğiniz bir yer',
          example_sentence: "I need to go to the supermarket to buy groceries.",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };

    return mockLocationWords[placeType] || [];
  } catch (error: any) {
    console.error('Konum kelimeleri alınırken hata:', error.message);
    throw error;
  }
};

// Tüm konum tabanlı kelimeleri getir - Göstermelik
export const getAllLocationWords = async (): Promise<LocationWord[]> => {
  try {
    // Tüm göstermelik konum kelimeleri
    return [
      {
        id: 'loc-1',
        place_type: 'restaurant',
        turkish_name: 'Restoran',
        english_name: 'Restaurant',
        description: 'Yemek yiyebileceğiniz bir yer',
        example_sentence: "Let's go to a restaurant for dinner.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'loc-2',
        place_type: 'restaurant',
        turkish_name: 'Kafe',
        english_name: 'Cafe',
        description: 'Kahve ve atıştırmalıklar sunan bir yer',
        example_sentence: "I like to work at a cafe in the morning.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'loc-3',
        place_type: 'hospital',
        turkish_name: 'Hastane',
        english_name: 'Hospital',
        description: 'Sağlık hizmetleri sunan bir yer',
        example_sentence: "My friend is in the hospital recovering from surgery.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'loc-4',
        place_type: 'school',
        turkish_name: 'Okul',
        english_name: 'School',
        description: 'Eğitim verilen bir yer',
        example_sentence: "My children go to school every weekday.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'loc-5',
        place_type: 'supermarket',
        turkish_name: 'Süpermarket',
        english_name: 'Supermarket',
        description: 'Gıda ve diğer ürünleri alabileceğiniz bir yer',
        example_sentence: "I need to go to the supermarket to buy groceries.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  } catch (error: any) {
    console.error('Tüm konum kelimeleri alınırken hata:', error.message);
    throw error;
  }
};

// Konum tabanlı kelime ekle - Göstermelik
export const addLocationWord = async (word: Omit<LocationWord, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  try {
    // Göstermelik bir ID döndür
    const mockId = 'loc-' + Date.now();
    console.log('Göstermelik konum kelimesi eklendi:', word.english_name);
    return mockId;
  } catch (error: any) {
    console.error('Konum kelimesi eklenirken hata:', error.message);
    throw error;
  }
};

// Yakındaki yer türlerine göre kelime öner - Göstermelik
export const suggestLocationWords = async (placeTypes: string[]): Promise<LocationWord[]> => {
  try {
    if (placeTypes.length === 0) {
      return [];
    }

    // Göstermelik konum kelimeleri
    const allMockWords = await getAllLocationWords();

    // Verilen yer türlerine göre filtrele
    return allMockWords.filter(word => placeTypes.includes(word.place_type));
  } catch (error: any) {
    console.error('Konum kelimeleri önerilirken hata:', error.message);
    throw error;
  }
};

// Varsayılan konum kelimelerini yükle - Göstermelik
export const loadDefaultLocationWords = async (): Promise<void> => {
  try {
    // Göstermelik olduğu için herhangi bir işlem yapmıyoruz
    console.log('Varsayılan konum kelimeleri yüklendi (göstermelik)');
    return;

    // Aşağıdaki kod sadece referans için bırakıldı
    // Varsayılan kelimeler
    const defaultWords = [
      {
        place_type: 'restaurant',
        turkish_name: 'Restoran',
        english_name: 'Restaurant',
        description: 'Yemek yiyebileceğiniz bir yer',
        example_sentence: 'Let\'s go to a restaurant for dinner.',
      },
      {
        place_type: 'cafe',
        turkish_name: 'Kafe',
        english_name: 'Cafe',
        description: 'Kahve ve atıştırmalıklar sunan bir yer',
        example_sentence: 'I like to work at a cafe in the morning.',
      },
      {
        place_type: 'hospital',
        turkish_name: 'Hastane',
        english_name: 'Hospital',
        description: 'Sağlık hizmetleri sunan bir yer',
        example_sentence: 'My friend is in the hospital recovering from surgery.',
      },
      {
        place_type: 'pharmacy',
        turkish_name: 'Eczane',
        english_name: 'Pharmacy',
        description: 'İlaç alabileceğiniz bir yer',
        example_sentence: 'I need to go to the pharmacy to pick up my prescription.',
      },
      {
        place_type: 'school',
        turkish_name: 'Okul',
        english_name: 'School',
        description: 'Eğitim verilen bir yer',
        example_sentence: 'My children go to school every weekday.',
      },
      {
        place_type: 'library',
        turkish_name: 'Kütüphane',
        english_name: 'Library',
        description: 'Kitapların bulunduğu bir yer',
        example_sentence: 'I borrow books from the library every month.',
      },
      {
        place_type: 'park',
        turkish_name: 'Park',
        english_name: 'Park',
        description: 'Açık havada vakit geçirebileceğiniz bir yer',
        example_sentence: 'We had a picnic in the park last weekend.',
      },
      {
        place_type: 'supermarket',
        turkish_name: 'Süpermarket',
        english_name: 'Supermarket',
        description: 'Gıda ve diğer ürünleri alabileceğiniz bir yer',
        example_sentence: 'I need to go to the supermarket to buy groceries.',
      },
      {
        place_type: 'bank',
        turkish_name: 'Banka',
        english_name: 'Bank',
        description: 'Para işlemlerini yapabileceğiniz bir yer',
        example_sentence: 'I went to the bank to deposit some money.',
      },
      {
        place_type: 'post_office',
        turkish_name: 'Postane',
        english_name: 'Post Office',
        description: 'Posta ve kargo işlemlerini yapabileceğiniz bir yer',
        example_sentence: 'I need to go to the post office to mail this package.',
      },
      {
        place_type: 'gym',
        turkish_name: 'Spor Salonu',
        english_name: 'Gym',
        description: 'Spor yapabileceğiniz bir yer',
        example_sentence: 'I go to the gym three times a week.',
      },
      {
        place_type: 'cinema',
        turkish_name: 'Sinema',
        english_name: 'Cinema',
        description: 'Film izleyebileceğiniz bir yer',
        example_sentence: 'We watched the new movie at the cinema yesterday.',
      },
      {
        place_type: 'museum',
        turkish_name: 'Müze',
        english_name: 'Museum',
        description: 'Tarihi ve sanatsal eserlerin sergilendiği bir yer',
        example_sentence: 'We visited the art museum on our vacation.',
      },
      {
        place_type: 'hotel',
        turkish_name: 'Otel',
        english_name: 'Hotel',
        description: 'Konaklayabileceğiniz bir yer',
        example_sentence: 'We stayed at a nice hotel during our trip.',
      },
      {
        place_type: 'airport',
        turkish_name: 'Havalimanı',
        english_name: 'Airport',
        description: 'Uçak yolculuğu yapabileceğiniz bir yer',
        example_sentence: 'We arrived at the airport two hours before our flight.',
      },
    ];

    // Göstermelik olduğu için veritabanına ekleme yapmıyoruz
    // const { error: insertError } = await supabase
    //   .from('location_words')
    //   .insert(defaultWords);
    // if (insertError) throw insertError;
  } catch (error: any) {
    console.error('Varsayılan konum kelimeleri yüklenirken hata:', error.message);
    throw error;
  }
};
