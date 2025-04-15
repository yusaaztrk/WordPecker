import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useWordListStore } from '@/store/wordListStore';
import { useLearningStore } from '@/store/learningStore';
import { getWords } from '@/firebase/words';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import { ArrowLeft, Volume2, Check, X, ChevronRight } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function LearnScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { fetchList } = useWordListStore();
  const { startSession, completeSession } = useLearningStore();
  
  const [list, setList] = useState<any>(null);
  const [words, setWords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Learning session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wordResults, setWordResults] = useState<any[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  
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
        
        // Shuffle words for learning
        const shuffledWords = [...wordsData].sort(() => Math.random() - 0.5);
        setWords(shuffledWords);
        
        // Start learning session
        const session = await startSession(listId, 'learn', shuffledWords.map(w => w.id));
        setSessionId(session);
        
        // Generate options for first word
        generateOptions(shuffledWords, 0);
      } catch (error) {
        console.error('Error loading learning data:', error);
        Alert.alert('Hata', 'Öğrenme verileri yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [listId]);
  
  const generateOptions = (wordsList: any[], index: number) => {
    const correctWord = wordsList[index];
    
    // Get 3 random incorrect options
    const incorrectOptions: string[] = [];
    const availableWords = wordsList.filter(w => w.id !== correctWord.id);
    
    while (incorrectOptions.length < 3 && availableWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableWords.length);
      incorrectOptions.push(availableWords[randomIndex].definition);
      availableWords.splice(randomIndex, 1);
    }
    
    // Add correct option and shuffle
    const allOptions = [...incorrectOptions, correctWord.definition];
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
    
    setOptions(shuffledOptions);
  };
  
  const handleOptionSelect = (index: number) => {
    if (showAnswer) return;
    
    const currentWord = words[currentIndex];
    const selectedDefinition = options[index];
    const isAnswerCorrect = selectedDefinition === currentWord.definition;
    
    setSelectedOption(index);
    setIsCorrect(isAnswerCorrect);
    setShowAnswer(true);
    
    if (isAnswerCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    // Record result
    const previousMastery = currentWord.mastery || 0;
    const masteryChange = isAnswerCorrect ? 10 : -5;
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
      setSelectedOption(null);
      setIsCorrect(null);
      generateOptions(words, currentIndex + 1);
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
      'Öğrenme oturumundan çıkmak istediğinize emin misiniz?',
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
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.completionContainer}>
          <Text style={[styles.completionTitle, { color: colors.text }]}>
            Tebrikler!
          </Text>
          
          <Text style={[styles.completionSubtitle, { color: colors.textSecondary }]}>
            Öğrenme oturumunu tamamladınız
          </Text>
          
          <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.scoreTitle, { color: colors.text }]}>
              Sonuçlarınız
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
                Başarı Oranı:
              </Text>
              <Text style={[styles.scoreValue, { color: colors.success }]}>
                %{Math.round((correctAnswers / words.length) * 100)}
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
              title="Tekrar Öğren"
              onPress={() => router.replace(`/learn/${listId}`)}
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
          
          {showAnswer && currentWord.example && (
            <View style={[styles.exampleContainer, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.exampleLabel, { color: colors.primary }]}>
                Örnek:
              </Text>
              <Text style={[styles.example, { color: colors.text }]}>
                {currentWord.example}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.questionText, { color: colors.text }]}>
          Bu kelimenin anlamı nedir?
        </Text>
        
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                { 
                  backgroundColor: colors.card,
                  borderColor: getOptionBorderColor(index, selectedOption, isCorrect, options, currentWord.definition, colors),
                },
                selectedOption === index && { borderWidth: 2 }
              ]}
              onPress={() => handleOptionSelect(index)}
              disabled={showAnswer}
            >
              <Text 
                style={[
                  styles.optionText, 
                  { color: colors.text }
                ]}
                numberOfLines={2}
              >
                {option}
              </Text>
              
              {showAnswer && option === currentWord.definition && (
                <View style={[styles.correctBadge, { backgroundColor: colors.success }]}>
                  <Check size={16} color="#FFFFFF" />
                </View>
              )}
              
              {showAnswer && selectedOption === index && option !== currentWord.definition && (
                <View style={[styles.incorrectBadge, { backgroundColor: colors.error }]}>
                  <X size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
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

// Helper function to determine option border color
const getOptionBorderColor = (
  index: number, 
  selectedOption: number | null, 
  isCorrect: boolean | null,
  options: string[],
  correctDefinition: string,
  colors: any
) => {
  if (!selectedOption) return colors.border;
  
  const isSelectedOption = index === selectedOption;
  const isCorrectOption = options[index] === correctDefinition;
  
  if (isSelectedOption) {
    return isCorrect ? colors.success : colors.error;
  }
  
  if (isCorrectOption && !isCorrect) {
    return colors.success;
  }
  
  return colors.border;
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
  exampleContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  example: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  correctBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incorrectBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: 'center',
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