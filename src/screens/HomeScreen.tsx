import React from 'react';
import { View, StyleSheet, ScrollView, Text, Platform, Dimensions } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { commonStyles } from '../styles/theme';

type RootStackParamList = {
  Home: undefined;
  FeaturePlaceholder: { featureId: number; featureName: string; description: string };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// Özellik tanımlamaları
const features = [
  {
    id: 1,
    name: 'Kullanıcı Girişi',
    description: 'E-posta/şifre ve sosyal medya ile güvenli ve kullanıcı dostu giriş/kayıt sistemi.',
    expectedFunctionality: [
      'E-posta/şifre ile kullanıcı kaydı',
      'E-posta/şifre ile giriş',
      'Şifre kurtarma',
      'Kullanıcı profili görüntüleme ve yönetimi',
      'Oturum yönetimi',
      'Güvenli token saklama'
    ]
  },
  {
    id: 2,
    name: 'Kelime Listeleri',
    description: 'Kullanıcının oluşturduğu tüm kelime listelerini detayları ve yönetim seçenekleriyle görüntüleme.',
    expectedFunctionality: [
      'Tüm listeleri önizleme bilgileriyle gösterme',
      'Liste sıralama ve filtreleme seçenekleri',
      'Hızlı eylemler (öğrenme, test, detaylar)',
      'İlerleme göstergeleri',
      'Yenileme ve sayfalama'
    ]
  },
  {
    id: 3,
    name: 'Liste Oluştur',
    description: 'İsim, açıklama ve bağlam bilgileriyle yeni kelime listesi oluşturma.',
    expectedFunctionality: [
      'Doğrulama ile liste oluşturma formu',
      'İsteğe bağlı kaynak belirtme alanı',
      'Liste için dil seçimi',
      'Oluşturma sonrası kelime ekleme seçeneği',
      'Yaygın liste türleri için şablonlar'
    ]
  },
  {
    id: 4,
    name: 'Kelime Ekle',
    description: 'Mevcut listeye anlamları ve bağlam örnekleriyle yeni kelimeler ekleme.',
    expectedFunctionality: [
      'Otomatik tamamlama önerileriyle kelime ekleme formu',
      'API ile otomatik anlam getirme',
      'Toplu kelime ekleme özelliği',
      'Bağlam örneği alanı',
      'Resim/telaffuz ilişkilendirme (opsiyonel)'
    ]
  },
  {
    id: 5,
    name: 'Öğrenme Modu',
    description: 'Duolingo tarzı alıştırmalarla liste kelimelerini öğrenme deneyimi.',
    expectedFunctionality: [
      'Çoktan seçmeli alıştırmalar',
      'Oturum sırasında ilerleme takibi',
      'Motivasyon için seri sayacı',
      'Cevaplara geri bildirim',
      'Oturum devamı ve geçmişi',
      'Çeşitli alıştırma türleri'
    ]
  },
  {
    id: 6,
    name: 'Test Modu',
    description: 'Liste kelimelerini daha zorlu bir test formatıyla sınama.',
    expectedFunctionality: [
      'Öğrenme modundan daha zorlu sorular',
      'Puan takibi ve geçmişi',
      'Süre sınırı seçeneği',
      'Yanlış cevapları gözden geçirme',
      'Test sonuç özeti',
      'Sonuçları paylaşma özelliği'
    ]
  },
  {
    id: 7,
    name: 'Liste Detayları',
    description: 'Tüm kelimeleri ve yönetim seçenekleriyle kelime listesinin detaylı görünümü.',
    expectedFunctionality: [
      'Listedeki tüm kelimeleri anlamlarıyla gösterme',
      'Kelime düzenleme ve silme',
      'Liste bilgilerini düzenleme',
      'İlerleme istatistikleri',
      'Öğrenme/Test modu başlatma seçenekleri',
      'Kelime sıralama ve filtreleme'
    ]
  },
  {
    id: 8,
    name: 'İlerleme Takibi',
    description: 'Tüm listeler ve kelimeler için istatistikler ve görselleştirmelerle öğrenme ilerlemesini takip etme.',
    expectedFunctionality: [
      'Genel öğrenme istatistikleri',
      'Liste bazında ilerleme görünümü',
      'Kelime hakimiyet göstergeleri',
      'İlerleme geçmişi grafikleri',
      'Öğrenme serileri ve başarılar',
      'Önerilen tekrar kelimeleri'
    ]
  },
  {
    id: 9,
    name: 'Arama',
    description: 'Listeler ve kelimeler arasında filtreleme seçenekleriyle arama işlevi.',
    expectedFunctionality: [
      'Tüm içerikte genel arama',
      'Liste, tarih, ilerleme seviyesine göre filtreleme',
      'Son aramalar geçmişi',
      'Sesli arama özelliği',
      'Önerilen arama terimleri',
      'Arama sonuçlarından doğrudan eylemler'
    ]
  },
  {
    id: 10,
    name: 'Ayarlar',
    description: 'Öğrenme deneyimini özelleştirmek için uygulama ayarları ve tercihler.',
    expectedFunctionality: [
      'Tema ve görünüm ayarları',
      'Bildirim tercihleri',
      'Varsayılan liste seçenekleri',
      'Öğrenme oturumu yapılandırmaları',
      'Veri yönetimi (dışa/içe aktarma/temizleme)',
      'Hesap ayarları entegrasyonu'
    ]
  },
  {
    id: 11,
    name: 'Yenilikçi Özellik 1',
    description: 'Mobil özellikleri kullanan ve dil öğrenmeyi geliştiren ilk yenilikçi özelliğinizi tasarlayın.',
    expectedFunctionality: [
      'Temel uygulamada olmayan benzersiz değer önerisi',
      'Mobil özelliklerin kullanımı',
      'Mevcut özelliklerle entegrasyon',
      'Kullanıcı dostu deneyim',
      'Performans değerlendirmesi'
    ]
  },
  {
    id: 12,
    name: 'Yenilikçi Özellik 2',
    description: 'Mobil dil öğrenenler için benzersiz bir avantaj sunan ikinci yenilikçi özelliğinizi tasarlayın.',
    expectedFunctionality: [
      'Öğrenme etkinliğini artıran özgün fikir',
      'Mobil öncelikli tasarım yaklaşımı',
      'Uygulama iş akışıyla entegrasyon',
      'Erişilebilir ve sezgisel arayüz',
      'Kaynak verimli uygulama'
    ]
  }
];

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const navigateToFeature = (feature: typeof features[0]) => {
    navigation.navigate('FeaturePlaceholder', {
      featureId: feature.id,
      featureName: feature.name,
      description: feature.description
    });
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.instructions}>
          Bu proje 13qw özellik için yer tutucu ekranlar içermektedir.
          Göreviniz temel özellikleri uygulamak ve 2 yenilikçi özellik geliştirmektir.
          Özellik açıklaması ve gereksinimlerini görmek için her bir düğmeye tıklayın.
        </Text>
        
        <View style={styles.grid}>
          {features.map((feature) => (
            <Card key={feature.id} style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>{feature.name}</Title>
                <Paragraph style={styles.cardDescription} numberOfLines={2}>
                  {feature.description}
                </Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button 
                  mode="contained" 
                  onPress={() => navigateToFeature(feature)}
                  style={styles.button}
                >
                  İncele
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={true}
    >
      {/* Mobil için mevcut içerik */}
      <Text style={styles.instructions}>
        Bu proje 13 özellik için yer tutucu ekranlar içermektedir.
        Göreviniz temel özellikleri uygulamak ve 2 yenilikçi özellik geliştirmektir.
        Özellik açıklaması ve gereksinimlerini görmek için her bir düğmeye tıklayın.
      </Text>
      
      <View style={styles.grid}>
        {features.map((feature) => (
          <Card key={feature.id} style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>{feature.name}</Title>
              <Paragraph style={styles.cardDescription} numberOfLines={2}>
                {feature.description}
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button 
                mode="contained" 
                onPress={() => navigateToFeature(feature)}
                style={styles.button}
              >
                İncele
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: Platform.select({
    web: {
      height: Dimensions.get('window').height,
      overflow: 'scroll',
      padding: 16,
      backgroundColor: '#0F172A',
    },
    default: {
      flex: 1,
      padding: 16,
      backgroundColor: '#0F172A',
    },
  }),
  scrollViewContent: {
    ...(Platform.OS === 'web' ? {
      minHeight: '100%',
    } : {
      flexGrow: 1,
    }),
  },
  instructions: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
    color: '#94A3B8',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
    ...(Platform.OS === 'web' ? {
      maxWidth: 1200,
      marginHorizontal: 'auto',
    } : {}),
  },
  card: {
    width: Platform.OS === 'web' ? '31%' : '48%',
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    ...(Platform.OS === 'web' ? {
      minWidth: 280,
    } : {}),
  },
  cardTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cardDescription: {
    color: '#94A3B8', // slate.400
    fontSize: 14,
  },
  button: {
    backgroundColor: '#4CAF50', // Green
  }
});

export default HomeScreen;
