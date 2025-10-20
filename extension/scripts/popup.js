import { renderQuestionnaire, collectQuestionnaireResponses } from './questionnaire.js';
import { fetchRecentHistory, computeHistoryFeatures } from './historyAnalyzer.js';
import {
  estimateTraits,
  inferEnneagram,
  buildCompatibilityInsights,
  TRAIT_KEYS_LIST,
} from './personalityModel.js';
import { generateProfileNarrative } from './llm.js';

const statusEl = document.getElementById('status');
const questionnaireEl = document.getElementById('questionnaire');
const resultsEl = document.getElementById('results');
const traitScoresEl = document.getElementById('traitScores');
const enneagramEl = document.getElementById('enneagram');
const compatibilityEl = document.getElementById('compatibility');
const growthEl = document.getElementById('growth');
const profileNarrativeEl = document.getElementById('profileNarrative');
const analyzeBtn = document.getElementById('analyzeBtn');

renderQuestionnaire(questionnaireEl);

function updateStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.dataset.type = type;
}

function renderTraitBars(traits) {
  traitScoresEl.innerHTML = '<p class="result-title">Big Five Pulse</p>';
  TRAIT_KEYS_LIST.forEach((trait) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'trait-bar';

    const label = document.createElement('span');
    label.textContent = trait;
    wrapper.appendChild(label);

    const progress = document.createElement('div');
    progress.className = 'progress';

    const bar = document.createElement('div');
    bar.style.width = `${traits[trait]}%`;
    progress.appendChild(bar);

    const value = document.createElement('small');
    value.textContent = `${traits[trait]} / 100`;

    wrapper.appendChild(progress);
    wrapper.appendChild(value);

    traitScoresEl.appendChild(wrapper);
  });
}

function renderEnneagram(enneagram) {
  enneagramEl.innerHTML = `<p class="result-title">Enneagram Mapping</p>
    <p><strong>${enneagram.coreType}</strong> — ${enneagram.wing}</p>
    <small>${enneagram.description}</small>`;
}

function renderCompatibility(compatibility) {
  compatibilityEl.innerHTML = '<p class="result-title">Compatibility Signals</p>';
  const list = document.createElement('ul');
  compatibility.idealPairings.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });
  compatibilityEl.appendChild(list);
}

function renderGrowth(compatibility) {
  growthEl.innerHTML = '<p class="result-title">Growth Micro-habits</p>';
  const list = document.createElement('ul');
  compatibility.growthActivities.slice(0, 3).forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });
  growthEl.appendChild(list);
}

function showResults() {
  resultsEl.classList.remove('hidden');
  resultsEl.scrollIntoView({ behavior: 'smooth' });
}

async function handleAnalyze() {
  analyzeBtn.disabled = true;
  updateStatus('Collecting recent history signals…');

  try {
    const historyItems = await fetchRecentHistory();
    updateStatus('Extracting behavior features with TensorFlow.js…');
    const historyFeatures = computeHistoryFeatures(historyItems);

    const responses = collectQuestionnaireResponses(questionnaireEl);
    const traits = estimateTraits(historyFeatures, responses);
    renderTraitBars(traits);

    const enneagram = inferEnneagram(traits);
    renderEnneagram(enneagram);

    const compatibility = buildCompatibilityInsights(traits, enneagram);
    renderCompatibility(compatibility);
    renderGrowth(compatibility);

    updateStatus('Generating narrative locally with the browser LLM…');
    const narrative = await generateProfileNarrative(traits, enneagram, compatibility);
    profileNarrativeEl.innerHTML = `<p class="result-title">Narrative Blueprint</p><p>${narrative}</p>`;

    showResults();
    updateStatus('Profile ready! Save the insights for your dating presence.', 'success');
  } catch (error) {
    console.error(error);
    updateStatus('We hit a snag while analyzing. Please review permissions and try again.', 'error');
  } finally {
    analyzeBtn.disabled = false;
  }
}

analyzeBtn.addEventListener('click', handleAnalyze);
