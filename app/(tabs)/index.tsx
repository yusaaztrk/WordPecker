import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { useWordListStore } from '@/store/wordListStore';
import { useLearningStore } from '@/store/learningStore';
import { useLocationLearningStore } from '@/store/locationLearningStore';
import Button from '@/components/Button';
import Card from '@/components/Card';
import StatsCard from '@/components/StatsCard';
import EmptyState from '@/components/EmptyState';
import ListCard from '@/components/ListCard';
import { Plus, BookOpen, Brain, Trophy, TrendingUp, MapPin, X, Check } from 'lucide-react-native';
import * as Location from 'expo-location';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { lists, fetchLists, addWordToList } = useWordListStore();
  const { stats, updateStats } = useLearningStore();
  const { nearbyWords, fetchNearbyWords, loadDefaultWords } = useLocationLearningStore();

  // GPS ve konum durumu
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<string[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Kelime ekleme durumu
  const [addWordModalVisible, setAddWordModalVisible] = useState(false);
  const [selectedListId, setSelectedListId] = useState('');
  const [newWord, setNewWord] = useState({ term: '', definition: '', example: '' });

  useEffect(() => {
    fetchLists();
    updateStats();
    loadDefaultWords();
    requestLocationPermission();
  }, []);

  // Konum izni iste
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');

      if (status === 'granted') {
        await getLocation();
      }
    } catch (error) {
      console.error('Konum izni alınırken hata:', error);
    }
  };

  // Konum al
  const getLocation = async () => {
    try {
      setIsLoadingLocation(true);

      // Mevcut konumu al
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(location);

      // Rastgele yakındaki yer türlerini simüle et
      simulateNearbyPlaces();
    } catch (error) {
      console.error('Konum alınırken hata:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Yakındaki yerleri simüle et
  const simulateNearbyPlaces = () => {
    // Yer türlerini tanımla
    const placeTypes = [
      'restaurant', 'cafe', 'hospital', 'pharmacy', 'school',
      'library', 'park', 'supermarket', 'bank', 'post_office',
      'gym', 'cinema', 'museum', 'hotel', 'airport'
    ];

    // Rastgele 3-5 yer türü seç
    const count = Math.floor(Math.random() * 3) + 3; // 3-5 arası
    const selectedTypes = [];

    while (selectedTypes.length < count) {
      const randomIndex = Math.floor(Math.random() * placeTypes.length);
      const placeType = placeTypes[randomIndex];

      if (!selectedTypes.includes(placeType)) {
        selectedTypes.push(placeType);
      }
    }

    setNearbyPlaces(selectedTypes);
    fetchNearbyWords(selectedTypes);
  };

  // Kelime ekleme modalını aç
  const openAddWordModal = (listId: string) => {
    setSelectedListId(listId);
    setNewWord({ term: '', definition: '', example: '' });
    setAddWordModalVisible(true);
  };

  // Kelime ekle
  const handleAddWord = async () => {
    if (!newWord.term || !newWord.definition) {
      Alert.alert('Hata', 'Kelime ve anlamı boş olamaz');
      return;
    }

    try {
      await addWordToList(selectedListId, newWord);
      setAddWordModalVisible(false);
      Alert.alert('Başarılı', 'Kelime başarıyla eklendi');
      fetchLists(); // Listeleri yenile
    } catch (error) {
      Alert.alert('Hata', 'Kelime eklenirken bir hata oluştu');
    }
  };

  const recentLists = lists.slice(0, 3);

  // Calculate stats
  const totalWords = lists.reduce((sum, list) => sum + (list.word_count || 0), 0);
  const streakDays = stats?.streakDays || 0;
  const totalSessions = stats?.totalSessions || 0;
  const correctRate = stats?.totalQuestions
    ? Math.round((stats.totalCorrectAnswers / stats.totalQuestions) * 100)
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with greeting */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Merhaba,
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.displayName || 'Kullanıcı'}
            </Text>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=200&auto=format&fit=crop' }}
            style={styles.logo}
          />
        </View>

        {/* Stats cards */}
        <View style={styles.statsContainer}>
          <StatsCard
            title="Kelime"
            value={totalWords.toString()}
            icon={<BookOpen size={20} color={colors.primary} />}
            color={colors.primary}
          />
          <StatsCard
            title="Seri"
            value={streakDays.toString()}
            icon={<TrendingUp size={20} color={colors.secondary} />}
            color={colors.secondary}
          />
          <StatsCard
            title="Oturum"
            value={totalSessions.toString()}
            icon={<Brain size={20} color={colors.accent} />}
            color={colors.accent}
          />
          <StatsCard
            title="Başarı"
            value={`%${correctRate}`}
            icon={<Trophy size={20} color={colors.warning} />}
            color={colors.warning}
          />
        </View>

        {/* Quick actions */}
        <Card style={styles.actionsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Hızlı İşlemler
          </Text>
          <View style={styles.actionsContainer}>
            <Button
              title="Liste Oluştur"
              leftIcon={<Plus size={18} color="#FFFFFF" />}
              onPress={() => router.push('/list/create')}
              style={styles.actionButton}
            />
            <Button
              title="Listelerim"
              variant="outline"
              leftIcon={<BookOpen size={18} color={colors.primary} />}
              onPress={() => router.push('/(tabs)/lists')}
              style={styles.actionButton}
            />
          </View>
        </Card>

        {/* GPS Location Learning */}
        <Card style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <MapPin size={24} color={colors.primary} />
            <Text style={[styles.locationTitle, { color: colors.text }]}>
              Konuma Göre Öğren
            </Text>
          </View>

          {!locationPermission ? (
            <View style={styles.locationPermission}>
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                Yakınınızdaki yerlerin İngilizce karşılıklarını görmek için konum izni vermeniz gerekiyor.
              </Text>
              <Button
                title="Konum İzni Ver"
                onPress={requestLocationPermission}
                leftIcon={<MapPin size={18} color="#FFFFFF" />}
                style={styles.locationButton}
              />
            </View>
          ) : isLoadingLocation ? (
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              Konumunuz alınıyor...
            </Text>
          ) : nearbyWords.length > 0 ? (
            <View style={styles.nearbyWordsContainer}>
              <Text style={[styles.locationSubtitle, { color: colors.textSecondary }]}>
                Yakınınızdaki yerler:
              </Text>
              <View style={styles.nearbyWordsList}>
                {nearbyWords.slice(0, 2).map((word) => (
                  <View key={word.id} style={[styles.nearbyWordItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.englishName, { color: colors.primary }]}>
                      {word.english_name}
                    </Text>
                    <Text style={[styles.turkishName, { color: colors.text }]}>
                      {word.turkish_name}
                    </Text>
                  </View>
                ))}
              </View>
              <Button
                title="Tümünü Gör"
                variant="outline"
                onPress={() => router.push('/english/location')}
                style={styles.viewAllLocationButton}
              />
            </View>
          ) : (
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              Yakınınızda yer bulunamadı
            </Text>
          )}
        </Card>

        {/* Add Word Card */}
        <Card style={styles.addWordCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Hızlı Kelime Ekle
          </Text>
          {recentLists.length > 0 ? (
            <View style={styles.addWordContainer}>
              <Text style={[styles.addWordText, { color: colors.textSecondary }]}>
                Listelerinize hızlıca kelime ekleyin:
              </Text>
              <View style={styles.addWordButtons}>
                {recentLists.slice(0, 2).map((list) => (
                  <Button
                    key={list.id}
                    title={list.name}
                    leftIcon={<Plus size={18} color="#FFFFFF" />}
                    onPress={() => openAddWordModal(list.id)}
                    style={styles.addWordButton}
                  />
                ))}
              </View>
            </View>
          ) : (
            <Text style={[styles.addWordText, { color: colors.textSecondary }]}>
              Kelime eklemek için önce bir liste oluşturun.
            </Text>
          )}
        </Card>

        {/* Recent lists */}
        <View style={styles.recentListsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Son Listeleriniz
          </Text>

          {recentLists.length > 0 ? (
            <View style={styles.recentLists}>
              {recentLists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  onPress={() => router.push(`/list/${list.id}`)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              title="Henüz liste oluşturmadınız"
              description="Yeni bir kelime listesi oluşturarak öğrenmeye başlayın"
              buttonTitle="Liste Oluştur"
              onButtonPress={() => router.push('/list/create')}
              icon={<BookOpen size={40} color={colors.primary} />}
            />
          )}

          {recentLists.length > 0 && (
            <Button
              title="Tüm Listeleri Görüntüle"
              variant="ghost"
              onPress={() => router.push('/(tabs)/lists')}
              style={styles.viewAllButton}
            />
          )}
        </View>
      </ScrollView>

      {/* Add Word Modal */}
      <Modal
        visible={addWordModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddWordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Kelime Ekle</Text>
              <TouchableOpacity onPress={() => setAddWordModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Kelime</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  placeholder="Kelimeyi girin"
                  placeholderTextColor={colors.textSecondary}
                  value={newWord.term}
                  onChangeText={(text) => setNewWord({ ...newWord, term: text })}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Anlamı</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  placeholder="Anlamını girin"
                  placeholderTextColor={colors.textSecondary}
                  value={newWord.definition}
                  onChangeText={(text) => setNewWord({ ...newWord, definition: text })}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Örnek Cümle (Opsiyonel)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  placeholder="Örnek cümle girin"
                  placeholderTextColor={colors.textSecondary}
                  value={newWord.example}
                  onChangeText={(text) => setNewWord({ ...newWord, example: text })}
                />
              </View>
            </View>

            <Button
              title="Kelimeyi Ekle"
              leftIcon={<Check size={18} color="#FFFFFF" />}
              onPress={handleAddWord}
              style={styles.addButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  actionsCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  recentListsSection: {
    marginBottom: 24,
  },
  recentLists: {
    gap: 12,
  },
  viewAllButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
  locationCard: {
    marginBottom: 24,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  locationPermission: {
    alignItems: 'center',
  },
  locationText: {
    textAlign: 'center',
    marginBottom: 12,
  },
  locationButton: {
    minWidth: 150,
  },
  locationSubtitle: {
    marginBottom: 12,
  },
  nearbyWordsContainer: {
    width: '100%',
  },
  nearbyWordsList: {
    gap: 8,
    marginBottom: 12,
  },
  nearbyWordItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  englishName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  turkishName: {
    fontSize: 14,
  },
  viewAllLocationButton: {
    alignSelf: 'center',
  },
  addWordCard: {
    marginBottom: 24,
  },
  addWordContainer: {
    width: '100%',
  },
  addWordText: {
    marginBottom: 12,
  },
  addWordButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addWordButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalForm: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  addButton: {
    width: '100%',
  },
});