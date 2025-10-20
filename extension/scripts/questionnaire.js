export const BIG_FIVE_QUESTIONS = [
  {
    id: 'openness1',
    trait: 'Openness',
    prompt: 'I am drawn to exploring new ideas and unfamiliar topics.',
  },
  {
    id: 'openness2',
    trait: 'Openness',
    prompt: 'I enjoy experimenting with art, culture, or creative hobbies.',
  },
  {
    id: 'conscientiousness1',
    trait: 'Conscientiousness',
    prompt: 'I plan my activities carefully and follow through on commitments.',
  },
  {
    id: 'conscientiousness2',
    trait: 'Conscientiousness',
    prompt: 'I keep my living or working spaces organized.',
  },
  {
    id: 'extraversion1',
    trait: 'Extraversion',
    prompt: 'I gain energy by being around groups of people.',
  },
  {
    id: 'extraversion2',
    trait: 'Extraversion',
    prompt: 'I feel comfortable initiating conversations with new people.',
  },
  {
    id: 'agreeableness1',
    trait: 'Agreeableness',
    prompt: 'I empathize easily with other people’s emotions.',
  },
  {
    id: 'agreeableness2',
    trait: 'Agreeableness',
    prompt: 'I strive to keep harmony in my relationships.',
  },
  {
    id: 'emotional1',
    trait: 'Emotional Stability',
    prompt: 'I remain steady when plans change unexpectedly.',
  },
  {
    id: 'emotional2',
    trait: 'Emotional Stability',
    prompt: 'I bounce back quickly after setbacks.',
  },
  {
    id: 'openness3',
    trait: 'Openness',
    prompt: 'I like trying foods, places, or activities I have never experienced before.',
  },
  {
    id: 'conscientiousness3',
    trait: 'Conscientiousness',
    prompt: 'I create routines to help me hit long-term goals.',
  },
  {
    id: 'extraversion3',
    trait: 'Extraversion',
    prompt: 'I feel excited about attending social events or parties.',
  },
  {
    id: 'agreeableness3',
    trait: 'Agreeableness',
    prompt: 'I often offer support before others have to ask.',
  },
  {
    id: 'emotional3',
    trait: 'Emotional Stability',
    prompt: 'I keep calm under pressure.',
  },
  {
    id: 'openness4',
    trait: 'Openness',
    prompt: 'I am curious about perspectives different from my own.',
  },
  {
    id: 'conscientiousness4',
    trait: 'Conscientiousness',
    prompt: 'I double-check details to ensure I deliver quality.',
  },
  {
    id: 'extraversion4',
    trait: 'Extraversion',
    prompt: 'I naturally take the lead in group conversations.',
  },
  {
    id: 'agreeableness4',
    trait: 'Agreeableness',
    prompt: 'I show appreciation for the efforts of others.',
  },
  {
    id: 'emotional4',
    trait: 'Emotional Stability',
    prompt: 'I manage stress by keeping a positive mindset.',
  }
];

export function renderQuestionnaire(container) {
  container.innerHTML = '';
  BIG_FIVE_QUESTIONS.forEach((question, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'question';

    const title = document.createElement('h3');
    title.textContent = `${index + 1}. ${question.prompt}`;
    wrapper.appendChild(title);

    const scale = document.createElement('input');
    scale.type = 'range';
    scale.min = '1';
    scale.max = '5';
    scale.value = '3';
    scale.step = '1';
    scale.className = 'slider';
    scale.dataset.questionId = question.id;
    wrapper.appendChild(scale);

    const scaleLabels = document.createElement('div');
    scaleLabels.className = 'scale-labels';
    scaleLabels.innerHTML = '<small>Strongly Disagree</small><small style="float:right">Strongly Agree</small>';
    wrapper.appendChild(scaleLabels);

    container.appendChild(wrapper);
  });
}

export function collectQuestionnaireResponses(container) {
  const responses = {};
  container.querySelectorAll('input[type="range"]').forEach((input) => {
    responses[input.dataset.questionId] = Number.parseInt(input.value, 10);
  });
  return responses;
}
