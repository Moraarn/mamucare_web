import { UserStatus, RiskLevel } from '@/store/useStore'

export interface RiskResult {
  riskLevel: RiskLevel
  conditionChecked: string
  symptomsDetected: string[]
}

export const calculateRisk = (
  answers: boolean[],
  status: UserStatus
): RiskResult => {
  const symptomsDetected: string[] = []
  
  if (status === 'pregnant') {
    // Symptom names for pregnant status
    const symptomNames = [
      'Severe headache',
      'Swelling in face or hands',
      'Blurred vision or flashing lights',
      'Upper belly pain'
    ]
    
    // Add detected symptoms
    answers.forEach((answer, index) => {
      if (answer) {
        symptomsDetected.push(symptomNames[index])
      }
    })
    
    // Risk calculation for pregnant
    const yesCount = answers.filter(a => a).length
    let riskLevel: RiskLevel = 'low'
    
    if (
      (answers[0] && (answers[1] || answers[2])) || // Severe headache + (swelling OR vision)
      yesCount >= 3
    ) {
      riskLevel = 'high'
    } else if (yesCount >= 2) {
      riskLevel = 'medium'
    }
    
    return {
      riskLevel,
      conditionChecked: 'Preeclampsia',
      symptomsDetected
    }
  }
  
  if (status === 'postpartum_early') {
    // Symptom names for postpartum early status
    const symptomNames = [
      'Heavy bleeding',
      'Dizziness or fainting',
      'Fever or chills',
      'Foul-smelling discharge'
    ]
    
    // Add detected symptoms
    answers.forEach((answer, index) => {
      if (answer) {
        symptomsDetected.push(symptomNames[index])
      }
    })
    
    // Risk calculation for postpartum early
    let riskLevel: RiskLevel = 'low'
    
    if (
      answers[0] || // Heavy bleeding is always HIGH
      (answers[0] && answers[1]) || // Heavy bleeding + dizziness
      (answers[2] && answers[3]) // Fever + discharge
    ) {
      riskLevel = 'high'
    } else {
      const yesCount = answers.filter(a => a).length
      if (yesCount >= 2) {
        riskLevel = 'medium'
      }
    }
    
    return {
      riskLevel,
      conditionChecked: 'Postpartum complications',
      symptomsDetected
    }
  }
  
  // Default risk calculation for other statuses
  const symptomNames = [
    'Severe pain',
    'Fever or chills',
    'Dizziness or fainting',
    'Unusual bleeding'
  ]
  
  answers.forEach((answer, index) => {
    if (answer) {
      symptomsDetected.push(symptomNames[index])
    }
  })
  
  const yesCount = answers.filter(a => a).length
  let riskLevel: RiskLevel = 'low'
  
  if (yesCount >= 3) {
    riskLevel = 'high'
  } else if (yesCount >= 2) {
    riskLevel = 'medium'
  }
  
  return {
    riskLevel,
    conditionChecked: 'General health',
    symptomsDetected
  }
}
