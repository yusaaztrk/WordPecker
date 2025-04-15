import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useWordListStore } from '@/store/wordListStore';
import { useLearningStore } from '@/store/learningStore';
import { getWords } from '@/firebase/words';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import { ArrowLeft, Volume2, Check, X, ChevronRight, Clock } from 'lucide-react-native';

export default function TestScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { fetchList } = useWordListStore();
  const { startSession, completeSession } = useLearningStore();
  
  const [list, setList] = useState<any>(null);
  const [words, setWords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Test session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wordResults, setWordResults] = useState<any[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [timerActive, setTimerActive] = useState(false);
  
  useEffect(() => {
    if (!listId) return;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        const listData = await fetchList(listId);
        setList(listData);
        
        const wordsData = await getWords(listId);
        if (wordsData.length === 0) {
          Alert.alert('Uyarı', 'Bu listede kelime bulunmuyor', [
            { text: 'Tamam', onPress: () => router.back() }
          ]);
          return;
        }
        
        // Shuffle words for testing
        const shuffledWords = [...wordsData].sort(() => Math.random() - 0.5);
        setWords(shuffledWords);
        
        // Start test session
        const session = await startSession(listId, 'test', shuffledWords.map(w => w.id));
        setSessionId(session);
        
      } catch (error) {
        console.error('Error loading test data:', error);
        Alert.alert('Hata', 'Test verileri yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
        setTimerActive(true);
      }
    };
    
    loadData();
  }, [listId]);
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showAnswer) {
      handleCheckAnswer();
    }
    
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);
  
  const handleCheckAnswer = () => {
    setTimerActive(false);
    
    const currentWord = words[currentIndex];
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = currentWord.definition.trim().toLowerCase();
    
    // Check if answer is correct (simple string comparison)
    const isAnswerCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
    
    setIsCorrect(isAnswerCorrect);
    setShowAnswer(true);
    
    if (isAnswerCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    // Record result
    const previousMastery = currentWord.mastery || 0;
    const masteryChange = isAnswerCorrect ? 15 : -8; // Higher stakes in test mode
    const newMastery = Math.max(0, Math.min(100, previousMastery + masteryChange));
    
    setWordResults([
      ...wordResults,
      {
        wordId: currentWord.id,
        correct: isAnswerCorrect,
        previousMastery,
        newMastery,
      }
    ]);
  };
  
  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setUserAnswer('');
      setIsCorrect(null);
      setTimeLeft(30); // Reset timer
      setTimerActive(true);
    } else {
      // Session complete
      setSessionComplete(true);
      
      // Complete session in backend
      if (sessionId) {
        completeSession(sessionId, {
          totalQuestions: words.length,
          correctAnswers,
          wordResults,
        });
      }
    }
  };
  
  const handleExit = () => {
    Alert.alert(
      'Çıkış Yap',
      'Test oturumundan çıkmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış', 
          onPress: () => {
            // Complete session if not already completed
            if (sessionId && !sessionComplete) {
              completeSession(sessionId, {
                totalQuestions: currentIndex + 1,
                correctAnswers,
                wordResults,
              });
            }
            router.back();
          }
        },
      ]
    );
  };
  
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (sessionComplete) {
    const score = Math.round((correctAnswers / words.length) * 100);
    let feedback = '';
    
    if (score >= 90) {
      feedback = 'Mükemmel! Harika bir performans gösterdiniz.';
    } else if (score >= 70) {
      feedback = 'Çok iyi! Biraz daha pratik yaparak daha da gelişebilirsiniz.';
    } else if (score >= 50) {
      feedback = 'İyi. Daha fazla çalışarak gelişmeye devam edin.';
    } else {
      feedback = 'Bu kelimeleri biraz daha çalışmanız gerekiyor.';
    }
    
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.completionContainer}>
          <Text style={[styles.completionTitle, { color: colors.text }]}>
            Test Tamamlandı
          </Text>
          
          <Text style={[styles.completionSubtitle, { color: colors.textSecondary }]}>
            {feedback}
          </Text>
          
          <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.scoreTitle, { color: colors.text }]}>
              Test Sonuçları
            </Text>
            
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
                Toplam Soru:
              </Text>
              <Text style={[styles.scoreValue, { color: colors.text }]}>
                {words.length}
              </Text>
            </View>
            
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
                Doğru Cevap:
              </Text>
              <Text style={[styles.scoreValue, { color: colors.text }]}>
                {correctAnswers}
              </Text>
            </View>
            
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
                Başarı Puanı:
              </Text>
              <Text 
                style={[
                  styles.scoreValue, 
                  { color: getScoreColor(score, colors) }
                ]}
              >
                %{score}
              </Text>
            </View>
          </View>
          
          <View style={styles.completionButtons}>
            <Button
              title="Listeye Dön"
              variant="outline"
              onPress={() => router.replace(`/list/${listId}`)}
              style={styles.completionButton}
            />
            
            <Button
              title="Tekrar Test Et"
              onPress={() => router.replace(`/test/${listId}`)}
              style={styles.completionButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  const currentWord = words[currentIndex];
  const progress = (currentIndex + 1) / words.length;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {currentIndex + 1} / {words.length}
          </Text>
          <ProgressBar progress={progress} height={4} />
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.timerContainer}>
          <Clock size={20} color={timeLeft < 10 ? colors.error : colors.textSecondary} />
          <Text 
            style={[
              styles.timerText, 
              { 
                color: timeLeft < 10 ? colors.error : colors.textSecondary 
              }
            ]}
          >
            {timeLeft} saniye
          </Text>
        </View>
        
        <View style={[styles.wordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.wordLabel, { color: colors.textSecondary }]}>
            {list?.targetLanguage} Kelime:
          </Text>
          
          <View style={styles.wordContainer}>
            <Text style={[styles.word, { color: colors.text }]}>
              {currentWord.term}
            </Text>
            
            {currentWord.pronunciation && (
              <TouchableOpacity style={styles.pronunciationButton}>
                <Volume2 size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <Text style={[styles.questionText, { color: colors.text }]}>
          Bu kelimenin anlamını yazın:
        </Text>
        
        <View style={styles.answerContainer}>
          <TextInput
            style={[
              styles.answerInput,
              { 
                backgroundColor: colors.card,
                borderColor: showAnswer 
                  ? (isCorrect ? colors.success : colors.error)
                  : colors.border,
                color: colors.text,
              }
            ]}
            value={userAnswer}
            onChangeText={setUserAnswer}
            placeholder={`${list?.language} anlamı...`}
            placeholderTextColor={colors.textSecondary + '80'}
            editable={!showAnswer}
            multiline
          />
          
          {!showAnswer && (
            <Button
              title="Kontrol Et"
              onPress={handleCheckAnswer}
              style={styles.checkButton}
            />
          )}
        </View>
        
        {showAnswer && (
          <View style={[
            styles.resultContainer,
            { 
              backgroundColor: isCorrect ? colors.success + '20' : colors.error + '20',
              borderColor: isCorrect ? colors.success : colors.error,
            }
          ]}>
            <View style={styles.resultHeader}>
              {isCorrect ? (
                <Check size={20} color={colors.success} />
              ) : (
                <X size={20} color={colors.error} />
              )}
              <Text style={[
                styles.resultText,
                { color: isCorrect ? colors.success : colors.error }
              ]}>
                {isCorrect ? 'Doğru!' : 'Yanlış!'}
              </Text>
            </View>
            
            {!isCorrect && (
              <View style={styles.correctAnswerContainer}>
                <Text style={[styles.correctAnswerLabel, { color: colors.textSecondary }]}>
                  Doğru cevap:
                </Text>
                <Text style={[styles.correctAnswer, { color: colors.text }]}>
                  {currentWord.definition}
                </Text>
              </View>
            )}
            
            {currentWord.example && (
              <View style={styles.exampleContainer}>
                <Text style={[styles.exampleLabel, { color: colors.textSecondary }]}>
                  Örnek:
                </Text>
                <Text style={[styles.example, { color: colors.text }]}>
                  {currentWord.example}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        {showAnswer && (
          <Button
            title="Sonraki"
            rightIcon={<ChevronRight size={20} color="#FFFFFF" />}
            onPress={handleNext}
            style={styles.nextButton}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// Helper function to get color based on score
const getScoreColor = (score: number, colors: any) => {
  if (score < 50) return colors.error;
  if (score < 80) return colors.warning;
  return colors.success;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressContainer: {
    flex: 1,
    marginLeft: 16,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 16,
    marginLeft: 8,
  },
  wordCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  wordLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  word: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  pronunciationButton: {
    marginLeft: 12,
    padding: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  answerContainer: {
    marginBottom: 20,
  },
  answerInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  checkButton: {
    width: '100%',
  },
  resultContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  correctAnswerContainer: {
    marginBottom: 12,
  },
  correctAnswerLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  correctAnswer: {
    fontSize: 16,
    fontWeight: '500',
  },
  exampleContainer: {
    marginTop: 8,
  },
  exampleLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  example: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
  },
  nextButton: {
    width: '100%',
  },
  completionContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  scoreCard: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 16,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  completionButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  completionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
});