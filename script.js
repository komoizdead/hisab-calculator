const display = document.querySelector('#display');
const resultWords = document.querySelector('#resultWords');
const expressionPreview = document.querySelector('#expressionPreview');
const historyList = document.querySelector('#historyList');
const clearHistoryButton = document.querySelector('#clearHistory');
const vatToggles = document.querySelectorAll('.tax-toggle');

const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const banglaSmallNumbers = ['শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আঠাশ', 'ঊনত্রিশ', 'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ', 'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ', 'পঞ্চাশ', 'একান্ন', 'বাহান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'উনষাট', 'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'উনসত্তর', 'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'উনআশি', 'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'উননব্বই', 'নব্বই', 'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'];
const banglaScales = ['', 'শত', 'হাজার', 'লক্ষ', 'কোটি'];
const operators = ['+', '−', '×', '÷'];
let expression = '';
let justCalculated = false;
let taxBase = null;
let history = [];

function toBangla(value) {
  return String(value).replace(/\d+(?:\.\d+)?/g, (number) => {
    const [integerPart, decimalPart] = number.split('.');
    const groupedInteger = formatSouthAsianNumber(integerPart);
    const formattedNumber = decimalPart ? `${groupedInteger}.${decimalPart}` : groupedInteger;
    return formattedNumber.replace(/[0-9]/g, (digit) => banglaDigits[Number(digit)]);
  });
}

function formatSouthAsianNumber(value) {
  const digits = String(value).replace(/^0+(?=\d)/, '');
  if (digits.length <= 3) return digits;
  const lastThree = digits.slice(-3);
  const remaining = digits.slice(0, -3);
  const groupedRemaining = remaining.replace(/\d(?=(?:\d{2})+$)/g, '$&,');
  return `${groupedRemaining},${lastThree}`;
}

function toLatin(value) {
  return String(value).replace(/[০-৯]/g, (digit) => banglaDigits.indexOf(digit));
}

function underThousandWords(number) {
  const words = [];
  if (number >= 100) {
    words.push(`${banglaSmallNumbers[Math.floor(number / 100)]} শত`);
    number %= 100;
  }
  if (number) words.push(banglaSmallNumbers[number]);
  return words.join(' ');
}

function integerToBanglaWords(number) {
  if (number === 0) return banglaSmallNumbers[0];
  if (number < 100) return banglaSmallNumbers[number];

  const groups = [
    { value: 10000000, label: 'কোটি' },
    { value: 100000, label: 'লক্ষ' },
    { value: 1000, label: 'হাজার' },
    { value: 100, label: 'শত' }
  ];
  const words = [];
  let remainder = number;
  groups.forEach(({ value, label }) => {
    if (remainder >= value) {
      const count = Math.floor(remainder / value);
      words.push(`${count < 100 ? banglaSmallNumbers[count] : integerToBanglaWords(count)} ${label}`);
      remainder %= value;
    }
  });
  if (remainder) words.push(underThousandWords(remainder));
  return words.join(' ');
}

function banglaNumberWords(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '';
  const absoluteValue = Math.abs(numericValue);
  const [integerPart, decimalPart] = String(absoluteValue).split('.');
  let words = integerToBanglaWords(Number(integerPart));
  if (decimalPart) {
    words += ` দশমিক ${[...decimalPart].map((digit) => banglaSmallNumbers[Number(digit)]).join(' ')}`;
  }
  return numericValue < 0 ? `ঋণাত্মক ${words}` : words;
}

function updateDisplay() {
  display.textContent = expression ? toBangla(expression) : '০';
  expressionPreview.textContent = expression || 'প্রস্তুত';
  resultWords.textContent = justCalculated ? banglaNumberWords(expression) : '';
}

function addValue(value) {
  taxBase = null;
  if (justCalculated && !operators.includes(value)) {
    expression = '';
  }
  justCalculated = false;

  if (operators.includes(value)) {
    if (!expression) return;
    if (operators.includes(expression.at(-1))) {
      expression = expression.slice(0, -1) + value;
    } else {
      expression += value;
    }
  } else if (value === '.') {
    const currentNumber = expression.split(/[+−×÷]/).at(-1);
    if (currentNumber.includes('.')) return;
    expression += currentNumber ? '.' : '0.';
  } else {
    expression += value;
  }
  updateDisplay();
}

function clearAll() {
  expression = '';
  justCalculated = false;
  taxBase = null;
  setActiveVat(null);
  updateDisplay();
}

function deleteLast() {
  taxBase = null;
  if (justCalculated) {
    clearAll();
    return;
  }
  expression = expression.slice(0, -1);
  updateDisplay();
}

function calculatePercent() {
  taxBase = null;
  const match = expression.match(/(\d+(?:\.\d+)?)$/);
  if (!match) return;
  const percent = Number(match[1]) / 100;
  expression = expression.slice(0, match.index) + String(percent);
  updateDisplay();
}

function evaluateExpression() {
  if (!expression || operators.includes(expression.at(-1))) return;
  const safeExpression = expression.replaceAll('−', '-').replaceAll('×', '*').replaceAll('÷', '/');
  if (!/^[\d+*/. -]+$/.test(safeExpression)) return;

  try {
    const result = Function(`"use strict"; return (${safeExpression})`)();
    if (!Number.isFinite(result)) throw new Error('Invalid result');
    const formattedResult = Number.isInteger(result) ? String(result) : String(Number(result.toFixed(10)));
    addHistory(expression, formattedResult, banglaNumberWords(formattedResult));
    taxBase = null;
    expressionPreview.textContent = `${toBangla(expression)} =`;
    expression = formattedResult;
    justCalculated = true;
    updateDisplay();
  } catch {
    expressionPreview.textContent = 'হিসাবটি সঠিক নয়';
    display.textContent = 'ত্রুটি';
  }
}

function setActiveVat(rate) {
  vatToggles.forEach((button) => {
    const isActive = Number(button.dataset.vatRate) === rate;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function applyVat(rate) {
  if (!expression) return;
  if (!justCalculated) evaluateExpression();
  if (!expression || !justCalculated) return;

  if (taxBase === null) taxBase = Number(expression);
  const total = taxBase * (1 + rate / 100);
  const formattedTotal = Number.isInteger(total) ? String(total) : String(Number(total.toFixed(10)));
  const baseText = toBangla(String(taxBase));
  const rateText = toBangla(String(rate));
  expression = formattedTotal;
  justCalculated = true;
  setActiveVat(rate);
  expressionPreview.textContent = `${baseText} + ভ্যাট ${rateText}%`;
  resultWords.textContent = banglaNumberWords(formattedTotal);
  addHistory(`${taxBase} + ভ্যাট ${rate}%`, formattedTotal, banglaNumberWords(formattedTotal));
  updateDisplay();
  expressionPreview.textContent = `${baseText} + ভ্যাট ${rateText}%`;
}

function addHistory(previousExpression, result, resultWordsText) {
  history.unshift({ expression: previousExpression, result, resultWords: resultWordsText });
  history = history.slice(0, 5);
  renderHistory();
}

function renderHistory() {
  if (!history.length) {
    historyList.innerHTML = '<p class="empty-history">এখনো কোনো হিসাব নেই</p>';
    return;
  }
  historyList.innerHTML = history.map((item) => `
    <div class="history-item">
      <span class="history-expression">${toBangla(item.expression)} =</span>
      <strong class="history-result">${toBangla(item.result)}</strong>
      <span class="history-words">${item.resultWords}</span>
    </div>
  `).join('');
}

document.querySelectorAll('.key').forEach((button) => {
  button.addEventListener('click', () => {
    const { action, value } = button.dataset;
    if (action === 'clear') clearAll();
    else if (action === 'delete') deleteLast();
    else if (action === 'percent') calculatePercent();
    else if (action === 'equals') evaluateExpression();
    else addValue(value);
  });
});

clearHistoryButton.addEventListener('click', () => {
  history = [];
  renderHistory();
});

vatToggles.forEach((button) => {
  button.addEventListener('click', () => applyVat(Number(button.dataset.vatRate)));
});

document.addEventListener('keydown', (event) => {
  const keyMap = { '*': '×', '/': '÷', '-': '−' };
  if (/^[0-9.]$/.test(event.key)) addValue(event.key);
  else if (operators.includes(keyMap[event.key])) addValue(keyMap[event.key]);
  else if (event.key === 'Enter' || event.key === '=') evaluateExpression();
  else if (event.key === 'Backspace') deleteLast();
  else if (event.key === 'Escape') clearAll();
  else return;
  event.preventDefault();
});

updateDisplay();
