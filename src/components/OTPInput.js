import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, Keyboard } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

const OTPInput = ({
  length = 6,
  value = '',
  onChange,
  onComplete,
  autoFocus = true,
  secureTextEntry = false,
  disabled = false,
  error = false,
  style,
  cellStyle,
  ...props
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value);
      Keyboard.dismiss();
    }
  }, [value, length, onComplete]);

  const handleChange = (text, index) => {
    // Allow only numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length <= 1) {
      const newValue = value.split('');
      newValue[index] = numericText;
      const newOtp = newValue.join('');
      onChange(newOtp);

      // Move to next input
      if (numericText && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }
    } else {
      // Handle paste
      const pastedValue = numericText.slice(0, length);
      onChange(pastedValue);
      
      const nextIndex = Math.min(pastedValue.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
      
      const newValue = value.split('');
      newValue[index - 1] = '';
      onChange(newValue.join(''));
    }
  };

  const handleFocus = (index) => {
    setFocusedIndex(index);
  };

  const getCellStyle = (index) => {
    const isFocused = index === focusedIndex;
    const hasValue = value[index];
    
    return [
      styles.cell,
      isFocused && styles.cellFocused,
      error && styles.cellError,
      hasValue && styles.cellFilled,
      disabled && styles.cellDisabled,
      cellStyle,
    ];
  };

  return (
    <View style={[styles.container, style]} {...props}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={getCellStyle(index)}
          value={value[index] || ''}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => handleFocus(index)}
          keyboardType="number-pad"
          maxLength={1}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          selectTextOnFocus
          caretHidden
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  cell: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.gray300,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    textAlign: 'center',
    ...typography.h3,
    color: colors.textPrimary,
  },
  cellFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.gray50,
  },
  cellFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  cellError: {
    borderColor: colors.error,
  },
  cellDisabled: {
    backgroundColor: colors.gray100,
    borderColor: colors.gray200,
  },
});

export default OTPInput;
