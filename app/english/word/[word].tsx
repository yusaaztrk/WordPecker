import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useEnglishLearningStore } from '@/store/englishLearningStore';
import { ArrowLeft, Volume2, Star, BookOpen, Plus } from 'lucide-react-native';
import { Audio } from 'expo-av';
import Button from '@/components/Button';

export default function WordDetailScreen() {
  const { word: wordParam } = useLocalSearchParams<{ word: string }>();
  const word = decodeURIComponent(wordParam || '');
  
  const router = useRouter();
  const { colors } = useTheme();
  const {
    currentWord,
    isLoading,
    error,
    fetchWordInfo,
    markWordAsLearned,
  } = useEnglishLearningStore();

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [confidence, setConfidence] = useState(60); // Default confidence level

  useEffect(() => {
    if (word) {
      fetchWordInfo(word);
    }

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [word]);

  const playSound = async () => {
    if (!currentWord?.audio_url) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      setIsPlaying(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: currentWord.audio_url },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
      setIsPlaying(false);
      Alert.alert('Hata', 'Ses dosyası oynatılamadı');
    }
  };

  const handleLearnWord = async () => {
    if (!currentWord) return;
    
    try {
      await markWordAsLearned(currentWord.id, confidence);
      Alert.alert('Başarılı', 'Kelime öğrenildi olarak işaretlendi');
    } catch (error) {
      console.error('Error marking word as learned:', error);
      Alert.alert('Hata', 'Kelime kaydedilemedi');
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setConfidence(star * 20)}
            style={styles.starButton}
          >
            <Star
              size={28}
              color={colors.primary}
              fill={star <= confidence / 20 ? colors.primary : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Kelime bilgisi yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !currentWord) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Kelime Bulunamadı</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error || `"${word}" kelimesi bulunamadı`}
          </Text>
          <Button
            title="Geri Dön"
            onPress={() => router.back()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Kelime Detayı</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.wordHeader}>
          <Text style={[styles.wordTitle, { color: colors.text }]}>{currentWord.word}</Text>
          
          <View style={styles.phoneticContainer}>
            {currentWord.phonetic && (
              <Text style={[styles.phonetic, { color: colors.textSecondary }]}>
                {currentWord.phonetic}
              </Text>
            )}
            
            {currentWord.audio_url && (
              <TouchableOpacity
                onPress={playSound}
                style={[styles.audioButton, { backgroundColor: colors.primary }]}
                disabled={isPlaying}
              >
                <Volume2 size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.meaningsContainer}>
          {currentWord.meanings.map((meaning, index) => (
            <View
              key={index}
              style={[styles.meaningCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.partOfSpeech, { color: colors.primary }]}>
                {meaning.part_of_speech}
              </Text>
              
              <Text style={[styles.definition, { color: colors.text }]}>
                {meaning.definition}
              </Text>
              
              {meaning.example && (
                <Text style={[styles.example, { color: colors.textSecondary }]}>
                  "{meaning.example}"
                </Text>
              )}
              
              {meaning.synonyms && meaning.synonyms.length > 0 && (
                <View style={styles.synonymsContainer}>
                  <Text style={[styles.synonymsTitle, { color: colors.text }]}>
                    Eş anlamlılar:
                  </Text>
                  <Text style={[styles.synonyms, { color: colors.textSecondary }]}>
                    {meaning.synonyms.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.learnSection}>
          <Text style={[styles.learnTitle, { color: colors.text }]}>
            Bu kelimeyi ne kadar iyi biliyorsunuz?
          </Text>
          
          {renderStars()}
          
          <View style={styles.actionButtons}>
            <Button
              title="Kelimeyi Öğrendim"
              onPress={handleLearnWord}
              leftIcon={<Plus size={18} color="#FFFFFF" />}
              style={styles.learnButton}
            />
            
            <Button
              title="Kelime Listesine Ekle"
              onPress={() => Alert.alert('Bilgi', 'Bu özellik yakında eklenecek')}
              leftIcon={<BookOpen size={18} color="#FFFFFF" />}
              style={[styles.addButton, { backgroundColor: colors.card }]}
              textStyle={{ color: colors.text }}
            />
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
  wordHeader: {
    marginBottom: 24,
  },
  wordTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  phoneticContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phonetic: {
    fontSize: 18,
    marginRight: 12,
  },
  audioButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meaningsContainer: {
    marginBottom: 24,
    gap: 16,
  },
  meaningCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  partOfSpeech: {
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  definition: {
    fontSize: 16,
    marginBottom: 8,
  },
  example: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  synonymsContainer: {
    marginTop: 8,
  },
  synonymsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  synonyms: {
    fontSize: 14,
  },
  learnSection: {
    marginBottom: 32,
  },
  learnTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  starButton: {
    padding: 8,
  },
  actionButtons: {
    gap: 12,
  },
  learnButton: {
    marginBottom: 8,
  },
  addButton: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorButton: {
    minWidth: 150,
  },
});
