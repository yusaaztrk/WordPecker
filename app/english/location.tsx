import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { ArrowLeft, MapPin, Navigation, RefreshCw } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useLocationLearningStore } from '@/store/locationLearningStore';
import Button from '@/components/Button';

// Yer türlerini tanımla
const placeTypes = [
  { type: 'restaurant', name: 'Restoran' },
  { type: 'cafe', name: 'Kafe' },
  { type: 'hospital', name: 'Hastane' },
  { type: 'pharmacy', name: 'Eczane' },
  { type: 'school', name: 'Okul' },
  { type: 'library', name: 'Kütüphane' },
  { type: 'park', name: 'Park' },
  { type: 'supermarket', name: 'Süpermarket' },
  { type: 'bank', name: 'Banka' },
  { type: 'post_office', name: 'Postane' },
  { type: 'gym', name: 'Spor Salonu' },
  { type: 'cinema', name: 'Sinema' },
  { type: 'museum', name: 'Müze' },
  { type: 'hotel', name: 'Otel' },
  { type: 'airport', name: 'Havalimanı' },
];

export default function LocationLearningScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    nearbyWords,
    isLoading,
    error,
    fetchNearbyWords,
    loadDefaultWords,
  } = useLocationLearningStore();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<string[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);

  useEffect(() => {
    // Varsayılan kelimeleri yükle
    loadDefaultWords().catch(console.error);
    
    // Konum izni iste
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        await getLocation();
      }
    } catch (error) {
      console.error('Konum izni alınırken hata:', error);
      Alert.alert('Hata', 'Konum izni alınamadı');
    }
  };

  const getLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      // Mevcut konumu al
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation(location);
      
      // Rastgele yakındaki yer türlerini simüle et
      // Gerçek uygulamada burada Google Places API kullanılabilir
      simulateNearbyPlaces();
    } catch (error) {
      console.error('Konum alınırken hata:', error);
      Alert.alert('Hata', 'Konum alınamadı');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const simulateNearbyPlaces = () => {
    // Rastgele 3-5 yer türü seç
    const count = Math.floor(Math.random() * 3) + 3; // 3-5 arası
    const selectedTypes: string[] = [];
    
    while (selectedTypes.length < count) {
      const randomIndex = Math.floor(Math.random() * placeTypes.length);
      const placeType = placeTypes[randomIndex].type;
      
      if (!selectedTypes.includes(placeType)) {
        selectedTypes.push(placeType);
      }
    }
    
    setNearbyPlaces(selectedTypes);
    fetchNearbyWords(selectedTypes);
  };

  const refreshLocation = async () => {
    if (!locationPermission) {
      await requestLocationPermission();
      return;
    }
    
    await getLocation();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Konuma Göre Öğren</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <MapPin size={24} color={colors.primary} />
            <Text style={[styles.locationTitle, { color: colors.text }]}>
              Konumunuzdaki Yerler
            </Text>
          </View>
          
          {!locationPermission ? (
            <View style={[styles.permissionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.permissionText, { color: colors.text }]}>
                Yakınınızdaki yerlerin İngilizce karşılıklarını görmek için konum izni vermeniz gerekiyor.
              </Text>
              <Button
                title="Konum İzni Ver"
                onPress={requestLocationPermission}
                leftIcon={<MapPin size={18} color="#FFFFFF" />}
                style={styles.permissionButton}
              />
            </View>
          ) : isLoadingLocation ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Konumunuz alınıyor...
              </Text>
            </View>
          ) : (
            <>
              <View style={[styles.locationInfoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.locationInfo}>
                  <Text style={[styles.locationInfoText, { color: colors.text }]}>
                    {location ? (
                      `Enlem: ${location.coords.latitude.toFixed(6)}\nBoylam: ${location.coords.longitude.toFixed(6)}`
                    ) : (
                      'Konum bilgisi alınamadı'
                    )}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.refreshButton, { backgroundColor: colors.primary }]}
                  onPress={refreshLocation}
                >
                  <RefreshCw size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Yakınınızdaki Yerler
              </Text>

              {isLoading ? (
                <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
              ) : nearbyWords.length > 0 ? (
                <View style={styles.placesList}>
                  {nearbyWords.map((word) => (
                    <View
                      key={word.id}
                      style={[styles.placeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <View style={styles.placeHeader}>
                        <Text style={[styles.placeType, { color: colors.textSecondary }]}>
                          {placeTypes.find(p => p.type === word.place_type)?.name || word.place_type}
                        </Text>
                        <Navigation size={18} color={colors.primary} />
                      </View>
                      
                      <View style={styles.placeContent}>
                        <View style={styles.placeNames}>
                          <Text style={[styles.englishName, { color: colors.primary }]}>
                            {word.english_name}
                          </Text>
                          <Text style={[styles.turkishName, { color: colors.text }]}>
                            {word.turkish_name}
                          </Text>
                        </View>
                        
                        {word.description && (
                          <Text style={[styles.description, { color: colors.textSecondary }]}>
                            {word.description}
                          </Text>
                        )}
                        
                        {word.example_sentence && (
                          <Text style={[styles.example, { color: colors.text, fontStyle: 'italic' }]}>
                            "{word.example_sentence}"
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Yakınınızda yer bulunamadı
                </Text>
              )}
            </>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            Nasıl Çalışır?
          </Text>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.infoText, { color: colors.text }]}>
              Bu özellik, konumunuza göre yakınınızdaki yerlerin İngilizce karşılıklarını gösterir.
              Örneğin, bir restoran yakınındaysanız, "Restaurant" kelimesini ve kullanımını öğrenebilirsiniz.
            </Text>
            <Text style={[styles.infoText, { color: colors.text, marginTop: 8 }]}>
              Gerçek hayatta kullanılan İngilizce kelimeleri öğrenmek için harika bir yol!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  locationSection: {
    marginBottom: 24,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  permissionCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  permissionButton: {
    minWidth: 200,
  },
  locationInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationInfoText: {
    fontSize: 14,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  placesList: {
    gap: 12,
  },
  placeCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeType: {
    fontSize: 14,
  },
  placeContent: {
    gap: 8,
  },
  placeNames: {
    marginBottom: 4,
  },
  englishName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  turkishName: {
    fontSize: 16,
  },
  description: {
    fontSize: 14,
  },
  example: {
    fontSize: 14,
    marginTop: 4,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  loader: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    fontStyle: 'italic',
  },
});
