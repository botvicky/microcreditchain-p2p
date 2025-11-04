import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { LoanService } from '../../services/loanService';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface LoanApplicationScreenProps {
  offerId: string;
  onApplicationSubmitted: () => void;
}

export const LoanApplicationScreen: React.FC<LoanApplicationScreenProps> = ({
  offerId,
  onApplicationSubmitted,
}) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [statementFile, setStatementFile] = useState<any>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setStatementFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSubmitApplication = async () => {
    if (!statementFile) {
      Alert.alert('Error', 'Please upload your EcoCash statement');
      return;
    }

    setLoading(true);
    try {
      // Upload statement to backend (placeholder - implement upload in LoanService)
      const statementUrl = await LoanService.uploadStatement(statementFile.uri, 'temp-application-id');

      // Create loan application
      await LoanService.applyForLoan({
        borrowerId: String(user?.id || ''),
        offerId,
        statementUrl,
        status: 'pending',
      });

      Alert.alert(
        'Application Submitted',
        'Your loan application has been submitted. You will be notified once the AI analysis is complete.',
        [{ text: 'OK', onPress: onApplicationSubmitted }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Submitting application..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Apply for Loan</Text>
        <Text style={styles.subtitle}>Upload your EcoCash statement for AI analysis</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EcoCash Statement</Text>
          <Text style={styles.sectionDescription}>
            Upload your latest EcoCash statement (PDF format) for AI-powered credit analysis.
          </Text>
          
          <TouchableOpacity style={styles.uploadButton} onPress={handlePickDocument}>
            <Text style={styles.uploadButtonText}>
              {statementFile ? 'Document Selected ✓' : 'Select PDF Document'}
            </Text>
          </TouchableOpacity>
          
          {statementFile && (
            <Text style={styles.fileName}>{statementFile.name}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information (Optional)</Text>
          <TextInput
            style={styles.textArea}
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            placeholder="Provide any additional information that might help with your application..."
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>AI Analysis Process</Text>
          <Text style={styles.infoText}>
            • Your statement will be analyzed for transaction patterns{'\n'}
            • Creditworthiness score will be calculated{'\n'}
            • Risk assessment will be provided to the lender{'\n'}
            • Analysis typically takes 2-5 minutes
          </Text>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitApplication}>
          <Text style={styles.submitButtonText}>Submit Application</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#00224d',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
  },
  subtitle: {
    fontSize: 16,
    color: '#B3D9FF',
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  form: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#00224d',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#00224d',
    fontFamily: 'Inter-Bold',
  },
  fileName: {
    fontSize: 14,
    color: '#00bf80',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  infoBox: {
    backgroundColor: '#F0F4FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00224d',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2C2C2C',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#00224d',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
});
