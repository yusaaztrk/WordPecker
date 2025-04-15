import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useEnglishLearningStore } from '@/store/englishLearningStore';
import { ArrowLeft, Volume2, Check, X, ArrowRight } from 'lucide-react-native';
import { Audio } from 'expo-av';
import Button from '@/components/Button';

export default function ReviewScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    reviewWords,
    isLoading,
    error,
    fetchWordsForReview,
    markWordAsLearned,
  } = useEnglishLearningStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    fetchWordsForReview(10);
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const currentWord = reviewWords[currentIndex]?.english_words;

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
    }
  };

  const handleShowDefinition = () => {
    setShowDefinition(true);
  };

  const handleResponse = async (isCorrect: boolean) => {
    if (!currentWord) return;
    
    const wordId = reviewWords[currentIndex].word_id;
    const currentConfidence = reviewWords[currentIndex].confidence;
    
    // Güven seviyesini güncelle
    const newConfidence = isCorrect
      ? Math.min(100, currentConfidence + 10)
      : Math.max(0, currentConfidence - 5);
    
    try {
      await markWordAsLearned(wordId, newConfidence);
      
      if (isCorrect) {
        setCorrectCount(prev => prev + 1);
      }
      
      // Sonraki kelimeye geç
      if (currentIndex < reviewWords.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowDefinition(false);
      } else {
        setReviewCompleted(true);
      }
    } catch (error) {
      console.error('Error updating word:', error);
      Alert.alert('Hata', 'Kelime güncellenemedi');
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowDefinition(false);
    setReviewCompleted(false);
    setCorrectCount(0);
    fetchWordsForReview(10);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Kelimeler yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Kelime Tekrarı</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <Button
            title="Geri Dön"
            onPress={() => router.back()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (reviewWords.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Kelime Tekrarı</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Tekrar edilecek kelime bulunamadı
          </Text>
          <Button
            title="Geri Dön"
            onPress={() => router.back()}
            style={styles.emptyButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (reviewCompleted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Tekrar Tamamlandı</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.completedContainer}>
          <Text style={[styles.completedTitle, { color: colors.text }]}>
            Tebrikler!
          </Text>
          <Text style={[styles.completedText, { color: colors.textSecondary }]}>
            {reviewWords.length} kelimelik tekrarı tamamladınız.
          </Text>
          <Text style={[styles.scoreText, { color: colors.primary }]}>
            Doğru: {correctCount} / {reviewWords.length}
          </Text>
          <View style={styles.completedButtons}>
            <Button
              title="Yeni Tekrar"
              onPress={handleRestart}
              leftIcon={<ArrowRight size={18} color="#FFFFFF" />}
              style={styles.restartButton}
            />
            <Button
              title="Ana Sayfaya Dön"
              onPress={() => router.push('/english')}
              style={[styles.homeButton, { backgroundColor: colors.card }]}
              textStyle={{ color: colors.text }}
            />
          </View>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Kelime Tekrarı</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { backgroundColor: colors.border, width: '100%' }
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${((currentIndex + 1) / reviewWords.length) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {currentIndex + 1} / {reviewWords.length}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.wordHeader}>
            <Text style={[styles.wordText, { color: colors.text }]}>
              {currentWord?.word}
            </Text>
            
            {currentWord?.phonetic && (
              <Text style={[styles.phoneticText, { color: colors.textSecondary }]}>
                {currentWord.phonetic}
              </Text>
            )}
            
            {currentWord?.audio_url && (
              <TouchableOpacity
                onPress={playSound}
                style={[styles.audioButton, { backgroundColor: colors.primary }]}
                disabled={isPlaying}
              >
                <Volume2 size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          {showDefinition ? (
            <View style={styles.definitionContainer}>
              {currentWord?.meanings && currentWord.meanings.length > 0 && (
                <>
                  <Text style={[styles.partOfSpeech, { color: colors.primary }]}>
                    {currentWord.meanings[0].part_of_speech}
                  </Text>
                  <Text style={[styles.definition, { color: colors.text }]}>
                    {currentWord.meanings[0].definition}
                  </Text>
                  {currentWord.meanings[0].example && (
                    <Text style={[styles.example, { color: colors.textSecondary }]}>
                      "{currentWord.meanings[0].example}"
                    </Text>
                  )}
                </>
              )}
            </View>
          ) : (
            <View style={styles.questionContainer}>
              <Text style={[styles.questionText, { color: colors.textSecondary }]}>
                Bu kelimeyi biliyor musunuz?
              </Text>
              <Button
                title="Anlamı Göster"
                onPress={handleShowDefinition}
                style={styles.showButton}
              />
            </View>
          )}

          {showDefinition && (
            <View style={styles.responseButtons}>
              <TouchableOpacity
                style={[styles.responseButton, styles.incorrectButton, { borderColor: colors.error }]}
                onPress={() => handleResponse(false)}
              >
                <X size={24} color={colors.error} />
                <Text style={[styles.responseText, { color: colors.error }]}>
                  Bilmiyordum
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.responseButton, styles.correctButton, { borderColor: colors.success }]}
                onPress={() => handleResponse(true)}
              >
                <Check size={24} color={colors.success} />
                <Text style={[styles.responseText, { color: colors.success }]}>
                  Biliyordum
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
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
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'right',
  },
  cardContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  wordHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  phoneticText: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  audioButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  showButton: {
    minWidth: 150,
  },
  definitionContainer: {
    marginBottom: 24,
  },
  partOfSpeech: {
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'center',
  },
  definition: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  example: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  responseButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  responseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  incorrectButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
  },
  correctButton: {
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
  },
  responseText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 150,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  completedText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  completedButtons: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  restartButton: {
    marginBottom: 8,
  },
  homeButton: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
