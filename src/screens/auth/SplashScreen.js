import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Logo } from '../../components';
import { colors, spacing, typography } from '../../theme/colors';

const SplashScreen = () => {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Logo size="large" color={colors.white} />
        </View>
        
        <ActivityIndicator 
          size="large" 
          color={colors.white} 
          style={styles.loader}
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.version}>Версия 1.0.0</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  loader: {
    marginTop: spacing.xl,
  },
  footer: {
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  version: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.6)',
  },
});

export default SplashScreen;
