const { pipeline } = window.transformers || {};

let textGeneratorPromise;

async function getGenerator() {
  if (!pipeline) {
    return null;
  }

  if (!textGeneratorPromise) {
    textGeneratorPromise = pipeline('text-generation', 'Xenova/phi-2', {
      dtype: 'q8',
      device: 'webgpu',
    }).catch((error) => {
      console.warn('Falling back to distilled generator:', error);
      return pipeline('text-generation', 'Xenova/tiny-random-gpt2');
    });
  }

  return textGeneratorPromise;
}

export async function generateProfileNarrative(traits, enneagram, compatibility) {
  const prompt = `You are a dating coach and psychologist. Create a concise (220-260 words) dating profile summary. Incorporate Big Five scores ${JSON.stringify(
    traits
  )}, Enneagram ${enneagram.coreType} ${enneagram.wing}. Include strengths, relational needs, and playful conversation starters. Mention compatible partner archetypes: ${compatibility.idealPairings.join(
    '; '
  )}. Offer 2 growth micro-habits from ${compatibility.growthActivities.join('; ')}.`;

  try {
    const generator = await getGenerator();
    if (!generator) {
      throw new Error('Transformers pipeline unavailable');
    }
    const output = await generator(prompt, {
      max_new_tokens: 220,
      temperature: 0.7,
      top_p: 0.92,
    });

    const text = Array.isArray(output) ? output[0].generated_text : String(output);
    return text.replace(prompt, '').trim();
  } catch (error) {
    console.warn('LLM generation failed, using templated fallback.', error);
    return `I radiate ${traits['Openness']}% curiosity and a ${traits['Agreeableness']}% collaborative heart. As ${
      enneagram.coreType
    } ${enneagram.wing}, I look for partners who ${compatibility.idealPairings[0].toLowerCase()} I nurture chemistry through ${
      compatibility.growthActivities[0]
    }. Let’s co-design adventures that celebrate both our similarities and growth edges.`;
  }
}
