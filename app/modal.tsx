import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { X } from 'lucide-react-native';

export default function ModalScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Uygulama Hakkında</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=200&auto=format&fit=crop' }}
          style={styles.logo}
        />

        <Text style={[styles.appName, { color: colors.primary }]}>WordPecker</Text>

        <Text style={[styles.version, { color: colors.textSecondary }]}>
          Sürüm 1.0.0
        </Text>

        <Text style={[styles.description, { color: colors.text }]}>
          WordPecker, yabancı dil öğrenimini kolaylaştırmak ve eğlenceli hale getirmek için tasarlanmış bir kelime öğrenme uygulamasıdır.
        </Text>

        <View style={[styles.section, { borderTopColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Özellikler
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Özel kelime listeleri oluşturma
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Etkileşimli öğrenme modu
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Bilgi seviyenizi ölçen test modu
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                İlerleme takibi ve istatistikler
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Çoklu dil desteği
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { borderTopColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            İletişim
          </Text>
          <Text style={[styles.contactText, { color: colors.text }]}>
            Sorularınız, önerileriniz veya geri bildirimleriniz için:
          </Text>
          <Text style={[styles.email, { color: colors.primary }]}>
            destek@wordpecker.com
          </Text>
        </View>

        <View style={[styles.section, { borderTopColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Gizlilik Politikası
          </Text>
          <Text style={[styles.privacyText, { color: colors.text }]}>
            Gizliliğiniz bizim için önemlidir. Verileriniz güvenle saklanır ve üçüncü taraflarla paylaşılmaz.
          </Text>
          <TouchableOpacity
            style={[styles.linkButton, { borderColor: colors.primary }]}
            onPress={() => {
              Alert.alert(
                'Gizlilik Politikası',
                'WordPecker uygulamasının gizlilik politikası hakkında bilgi almak için web sitemizi ziyaret edebilirsiniz.',
                [{ text: 'Tamam', style: 'default' }]
              );
            }}
          >
            <Text style={[styles.linkButtonText, { color: colors.primary }]}>
              Gizlilik Politikasını Görüntüle
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.copyright, { color: colors.textSecondary }]}>
          © 2023 WordPecker. Tüm hakları saklıdır.
        </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    width: '100%',
    paddingTop: 24,
    marginTop: 8,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  featureList: {
    width: '100%',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  contactText: {
    fontSize: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  email: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  privacyText: {
    fontSize: 16,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  linkButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  copyright: {
    marginTop: 24,
    marginBottom: 16,
    fontSize: 14,
  },
});