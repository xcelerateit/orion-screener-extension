console.log('[OrionSummary] initialized');

const SUMMARY_ID = 'zcx9r_summary';
const two = (n) => String(n).padStart(2, '0');

const createOrGetSummary = () => {
  let host = document.getElementById(SUMMARY_ID);
  if (!host) {
    host = document.createElement('div');
    host.id = SUMMARY_ID;
    Object.assign(host.style, {
      position: 'fixed',
      top: '55px',
      left: '0',
      right: '0',
      zIndex: '2147483647',
      pointerEvents: 'auto',
      display: 'block',
      width: '85%',
      boxSizing: 'border-box',
      padding: '0 10px',
    });

    const shadow = host.attachShadow({ mode: 'open' });

    const container = document.createElement('div');
    Object.assign(container.style, {
      padding: '18px 10px',
      background: '#151515',
      color: '#3ee107ff',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex',
      gap: '20px',
      fontSize: '20px',
      alignItems: 'center',
      borderRadius: '0',
      boxShadow: '0 16px 48px rgba(0,0,0,0.75)',
      lineHeight: '3.58',
      whiteSpace: 'nowrap',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      width: '100%',
      boxSizing: 'border-box',
      margin: '0 auto',
      maxWidth: 'calc(100vw - 40px)',
    });
    container.id = 'inner-summary';

    shadow.appendChild(container);

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .segment { display: flex; align-items: center; gap: 6px; }
      .label { font-weight: 600; margin-right: 4px; }
    `;
    shadow.appendChild(styleEl);

    document.body.appendChild(host);
  }
  return host.shadowRoot.querySelector('#inner-summary');
};

const parseNumber = (text) => {
  if (!text) return 0;
  const cleaned = text.replace(/[^\d-]/g, '');
  const v = parseInt(cleaned, 10);
  return isNaN(v) ? 0 : v;
};

const parsePercent = (text) => {
  if (!text) return 0;
  const cleaned = text.replace(/[^\d.-]/g, '');
  const v = parseFloat(cleaned);
  return isNaN(v) ? 0 : v;
};

const formatNum = (n) => {
  return n.toLocaleString();
};

const updateSummary = () => {
  const table = document.querySelector('#coinTable');
  if (!table) {
    console.log('[OrionSummary] no table yet');
    return;
  }

  const headerCells = Array.from(table.querySelectorAll('thead th'));
  const ticksIdx = headerCells.findIndex(th => th.textContent.trim() === 'Ticks 5m');
  const volumeIdx = headerCells.findIndex(th => th.textContent.trim() === 'Volume 5m');
  const change1dIdx = headerCells.findIndex(th => th.textContent.trim() === 'Change 1d');
  const change1hIdx = headerCells.findIndex(th => th.textContent.trim() === 'Change 1h');
  
  if (ticksIdx === -1) {
    console.log('[OrionSummary] "Ticks 5m" header not found yet');
    return;
  }

  const rows = Array.from(table.querySelectorAll('tbody tr'));
  const totalRows = rows.length;
  let ticksSum = 0;
  let volumeSum = 0;
  let change1dSum = 0;
  let change1hSum = 0;
  
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells[ticksIdx]) {
      ticksSum += parseNumber(cells[ticksIdx].textContent);
    }
    if (volumeIdx !== -1 && cells[volumeIdx]) {
      volumeSum += parseNumber(cells[volumeIdx].textContent);
    }
    if (change1dIdx !== -1 && cells[change1dIdx]) {
      change1dSum += parsePercent(cells[change1dIdx].textContent);
    }
    if (change1hIdx !== -1 && cells[change1hIdx]) {
      change1hSum += parsePercent(cells[change1hIdx].textContent);
    }
  });

  const avgTicks = totalRows > 0 ? Math.round(ticksSum / totalRows) : 0;
  const avgVolume = totalRows > 0 ? Math.round(volumeSum / totalRows) : 0;

  const summary = createOrGetSummary();
  summary.innerHTML = `
    <div class="segment"><span class="label">Coins:</span><span>${formatNum(totalRows)}</span></div>
    <div class="segment"><span class="label">Total ticks:</span><span>${formatNum(ticksSum)}</span></div>
    <div class="segment"><span class="label">Avg ticks:</span><span>${formatNum(avgTicks)}</span></div>
    <div class="segment"><span class="label">Avg vol:</span><span>${formatNum(avgVolume)}</span></div>
  `;

  console.log('[OrionSummary] updated', { totalRows, ticksSum, avgTicks, volumeSum, avgVolume, timeStr });
};

const init = () => {
  const tryAttach = () => {
    const table = document.querySelector('#coinTable');
    if (!table) {
      setTimeout(tryAttach, 500);
      return;
    }

    updateSummary();

    const tbody = table.querySelector('tbody');
    if (tbody) {
      const observer = new MutationObserver(() => {
        updateSummary();
      });
      observer.observe(tbody, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    setInterval(updateSummary, 5000);
  };

  tryAttach();
};

init();