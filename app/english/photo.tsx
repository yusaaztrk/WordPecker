import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { ArrowLeft, Camera, Image as ImageIcon, Check, X } from 'lucide-react-native';
import Button from '@/components/Button';

// Göstermelik fotoğraf analiz sonuçları
const MOCK_RESULTS = {
  'apple': {
    image: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?q=80&w=200&auto=format&fit=crop',
    labels: [
      { text: 'Apple', confidence: 0.98, color: '#FF6B6B' },
      { text: 'Fruit', confidence: 0.95, color: '#4ECDC4' },
      { text: 'Red', confidence: 0.87, color: '#1A535C' },
    ]
  },
  'book': {
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop',
    labels: [
      { text: 'Book', confidence: 0.99, color: '#FF6B6B' },
      { text: 'Reading', confidence: 0.92, color: '#4ECDC4' },
      { text: 'Pages', confidence: 0.85, color: '#1A535C' },
    ]
  },
  'coffee': {
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&auto=format&fit=crop',
    labels: [
      { text: 'Coffee', confidence: 0.97, color: '#FF6B6B' },
      { text: 'Cup', confidence: 0.93, color: '#4ECDC4' },
      { text: 'Drink', confidence: 0.89, color: '#1A535C' },
    ]
  },
  'laptop': {
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=200&auto=format&fit=crop',
    labels: [
      { text: 'Laptop', confidence: 0.96, color: '#FF6B6B' },
      { text: 'Computer', confidence: 0.94, color: '#4ECDC4' },
      { text: 'Technology', confidence: 0.91, color: '#1A535C' },
    ]
  }
};

export default function PhotoLearningScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedWords, setSavedWords] = useState<string[]>([]);

  // Fotoğraf çekme simülasyonu
  const handleTakePhoto = () => {
    // Rastgele bir göstermelik sonuç seç
    const mockKeys = Object.keys(MOCK_RESULTS);
    const randomKey = mockKeys[Math.floor(Math.random() * mockKeys.length)];
    const mockResult = MOCK_RESULTS[randomKey];
    
    setSelectedImage(mockResult.image);
    setAnalysisResults(null);
    setIsAnalyzing(false);
  };

  // Galeriden seçme simülasyonu
  const handlePickImage = () => {
    // Rastgele bir göstermelik sonuç seç
    const mockKeys = Object.keys(MOCK_RESULTS);
    const randomKey = mockKeys[Math.floor(Math.random() * mockKeys.length)];
    const mockResult = MOCK_RESULTS[randomKey];
    
    setSelectedImage(mockResult.image);
    setAnalysisResults(null);
    setIsAnalyzing(false);
  };

  // Fotoğraf analizi simülasyonu
  const handleAnalyzeImage = () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    
    // Göstermelik analiz süresi (1.5 saniye)
    setTimeout(() => {
      // Seçilen görsele ait sonuçları bul
      const mockKey = Object.keys(MOCK_RESULTS).find(
        key => MOCK_RESULTS[key].image === selectedImage
      );
      
      if (mockKey) {
        setAnalysisResults(MOCK_RESULTS[mockKey]);
      }
      
      setIsAnalyzing(false);
    }, 1500);
  };

  // Kelimeyi kaydetme simülasyonu
  const handleSaveWord = (word: string) => {
    if (savedWords.includes(word)) {
      setSavedWords(savedWords.filter(w => w !== word));
      Alert.alert('Bilgi', `"${word}" kelimesi kaldırıldı`);
    } else {
      setSavedWords([...savedWords, word]);
      Alert.alert('Başarılı', `"${word}" kelimesi kaydedildi`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Fotoğrafla Öğren</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Fotoğraf çekerek veya galeriden seçerek nesnelerin İngilizce karşılıklarını öğrenin.
          </Text>

          {/* Fotoğraf alanı */}
          <View style={[styles.imageContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <ImageIcon size={64} color={colors.textSecondary} />
                <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                  Fotoğraf çekin veya galeriden seçin
                </Text>
              </View>
            )}
          </View>

          {/* Fotoğraf işlemleri */}
          <View style={styles.actions}>
            <Button
              title="Fotoğraf Çek"
              leftIcon={<Camera size={18} color="#FFFFFF" />}
              onPress={handleTakePhoto}
              style={styles.actionButton}
            />
            <Button
              title="Galeriden Seç"
              leftIcon={<ImageIcon size={18} color="#FFFFFF" />}
              onPress={handlePickImage}
              style={styles.actionButton}
            />
          </View>

          {/* Analiz butonu */}
          {selectedImage && !analysisResults && (
            <Button
              title={isAnalyzing ? "Analiz Ediliyor..." : "Analiz Et"}
              onPress={handleAnalyzeImage}
              disabled={isAnalyzing}
              style={styles.analyzeButton}
            />
          )}

          {/* Analiz sonuçları */}
          {analysisResults && (
            <View style={styles.resultsContainer}>
              <Text style={[styles.resultsTitle, { color: colors.text }]}>
                Analiz Sonuçları
              </Text>
              
              <View style={styles.labelsList}>
                {analysisResults.labels.map((label, index) => (
                  <View key={index} style={styles.labelItem}>
                    <View style={[styles.labelBadge, { backgroundColor: label.color }]}>
                      <Text style={styles.labelText}>{label.text}</Text>
                      <Text style={styles.confidenceText}>
                        {Math.round(label.confidence * 100)}%
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        { 
                          backgroundColor: savedWords.includes(label.text) 
                            ? colors.success 
                            : colors.card,
                          borderColor: colors.border
                        }
                      ]}
                      onPress={() => handleSaveWord(label.text)}
                    >
                      {savedWords.includes(label.text) ? (
                        <Check size={20} color="#FFFFFF" />
                      ) : (
                        <Plus size={20} color={colors.text} />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Nasıl çalışır */}
          <View style={[styles.howItWorksContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.howItWorksTitle, { color: colors.text }]}>
              Nasıl Çalışır?
            </Text>
            <Text style={[styles.howItWorksText, { color: colors.textSecondary }]}>
              1. Fotoğraf çekin veya galeriden bir görsel seçin{'\n'}
              2. "Analiz Et" butonuna basın{'\n'}
              3. Görseldeki nesnelerin İngilizce karşılıklarını görün{'\n'}
              4. Öğrenmek istediğiniz kelimeleri kaydedin
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
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  imageContainer: {
    aspectRatio: 4/3,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 16,
  },
  placeholderText: {
    marginTop: 16,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  analyzeButton: {
    marginBottom: 24,
  },
  resultsContainer: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  labelsList: {
    gap: 12,
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 12,
  },
  labelText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  confidenceText: {
    color: 'white',
    opacity: 0.8,
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  howItWorksContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  howItWorksText: {
    lineHeight: 24,
  },
});
