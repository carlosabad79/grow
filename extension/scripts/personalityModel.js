const TRAIT_KEYS = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Emotional Stability'];

function createModel() {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      units: 5,
      inputShape: [6],
      activation: 'sigmoid',
      useBias: true,
    })
  );

  const weights = tf.tensor2d(
    [
      [0.72, 0.24, 0.12, 0.15, 0.05],
      [-0.12, 0.68, 0.35, 0.28, 0.1],
      [0.08, -0.2, 0.74, -0.05, -0.18],
      [0.26, 0.33, 0.19, 0.62, 0.21],
      [-0.05, 0.45, -0.14, 0.31, 0.2],
      [0.11, -0.22, -0.31, 0.08, 0.66],
    ],
    [6, 5]
  );
  const bias = tf.tensor1d([0.25, 0.35, 0.32, 0.4, 0.38]);
  model.layers[0].setWeights([weights, bias]);
  return model;
}

const personalityModel = createModel();

function aggregateQuestionnaire(responses) {
  const traitTotals = new Map(
    TRAIT_KEYS.map((trait) => [trait, { total: 0, count: 0 }])
  );

  Object.entries(responses).forEach(([questionId, value]) => {
    const traitKey = TRAIT_KEYS.find((trait) => questionId.toLowerCase().includes(trait.split(' ')[0].toLowerCase()));
    if (!traitKey) {
      return;
    }
    const bucket = traitTotals.get(traitKey);
    bucket.total += value;
    bucket.count += 1;
  });

  const normalized = {};
  traitTotals.forEach((bucket, trait) => {
    normalized[trait] = bucket.count ? bucket.total / (bucket.count * 5) : 0.5;
  });
  return normalized;
}

export function estimateTraits(historyFeatures, questionnaireResponses) {
  const baseTensor = tf.tensor2d([historyFeatures]);
  const modelOutput = personalityModel.predict(baseTensor);
  const tfScores = modelOutput.arraySync()[0];
  baseTensor.dispose();
  modelOutput.dispose();

  const questionnaire = aggregateQuestionnaire(questionnaireResponses);
  const result = {};

  TRAIT_KEYS.forEach((trait, index) => {
    const modelScore = tfScores[index];
    const questionnaireScore = questionnaire[trait] ?? 0.5;
    const blended = modelScore * 0.45 + questionnaireScore * 0.55;
    result[trait] = Math.round(blended * 100);
  });

  return result;
}

export function inferEnneagram(traits) {
  const openness = traits['Openness'];
  const conscientiousness = traits['Conscientiousness'];
  const extraversion = traits['Extraversion'];
  const agreeableness = traits['Agreeableness'];
  const stability = traits['Emotional Stability'];

  if (openness >= 70 && extraversion >= 65) {
    return {
      coreType: 'Type 7 – The Enthusiast',
      wing: openness > conscientiousness ? 'Wing 8' : 'Wing 6',
      description:
        'Optimistic, possibility-seeking energy that thrives on new adventures while staying attuned to meaningful connections.',
    };
  }

  if (conscientiousness >= 70 && stability >= 60) {
    return {
      coreType: 'Type 1 – The Reformer',
      wing: agreeableness >= 65 ? 'Wing 2' : 'Wing 9',
      description:
        'Principled, purposeful mindset with a steady emotional base. You champion improvement and value integrity in relationships.',
    };
  }

  if (agreeableness >= 72) {
    return {
      coreType: 'Type 2 – The Giver',
      wing: extraversion >= 60 ? 'Wing 3' : 'Wing 1',
      description:
        'Warm, nurturing presence that builds intimacy through attentive support and generous listening.',
    };
  }

  if (stability < 55 && conscientiousness >= 60) {
    return {
      coreType: 'Type 6 – The Loyalist',
      wing: agreeableness >= 60 ? 'Wing 7' : 'Wing 5',
      description:
        'Steadfast and commitment-oriented with a careful eye on potential risks. You seek security and mutual trust.',
    };
  }

  return {
    coreType: 'Type 9 – The Peacemaker',
    wing: agreeableness >= 60 ? 'Wing 1' : 'Wing 8',
    description:
      'Grounded, collaborative energy that values harmony and shared meaning. You create calm spaces for authentic connection.',
  };
}

export function buildCompatibilityInsights(traits, enneagram) {
  const idealPairings = [];
  const growthActivities = [];

  if (traits['Extraversion'] >= 65) {
    idealPairings.push('You pair well with reflective partners (Introverts / Enneagram Type 5) who appreciate your spark.');
    growthActivities.push('Schedule balanced dates—mix lively social outings with quieter shared rituals.');
  } else {
    idealPairings.push('You shine with partners who initiate adventures (Extroverts / Enneagram Type 7) and respect your contemplative pace.');
    growthActivities.push('Practice one bold social experiment per week to widen your connection circle.');
  }

  if (traits['Conscientiousness'] >= 65) {
    idealPairings.push('Structured types (Big Five high Conscientiousness / Enneagram 1) align with your reliability.');
    growthActivities.push('Design a shared goal-setting ritual—monthly retrospectives with your future partner.');
  } else {
    idealPairings.push('Spontaneous partners (Big Five high Openness / Enneagram 7) can energize your adaptability.');
    growthActivities.push('Co-create a living bucket list that blends novelty with your comfort zones.');
  }

  if (traits['Agreeableness'] >= 65) {
    idealPairings.push('Compassionate partners (Enneagram 2 or 9) will resonate with your warmth and cooperative style.');
    growthActivities.push('Practice assertive communication drills to keep your needs voiced early.');
  } else {
    idealPairings.push('Direct communicators (Enneagram 8) can complement your candor and goal-focus.');
    growthActivities.push('Introduce weekly emotional check-ins to build empathy fluency.');
  }

  const resilienceTip = traits['Emotional Stability'] >= 60
    ? 'Maintain your steady emotional baseline with mindfulness or reflection rituals after intense dates.'
    : 'Adopt a recovery routine—journaling plus grounding breathwork—to bounce back from dating uncertainty.';

  growthActivities.push(resilienceTip);

  return {
    idealPairings,
    growthActivities,
    enneagramSummary: `${enneagram.coreType} with ${enneagram.wing}`,
  };
}

export const TRAIT_KEYS_LIST = TRAIT_KEYS;
