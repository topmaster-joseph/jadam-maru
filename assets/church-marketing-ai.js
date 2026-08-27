(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const KEY = 'ekodi-church-marketing-drafts-v1';
  const safe = value => String(value || '').trim();
  let churchAuthorized = false;

  function churchContext(context) {
    const values = [context?.workspaceName, context?.workspaceKey, context?.workspaceKind, context?.tenantId, context?.tenant, context?.storeName]
      .map(value => String(value || '').toLowerCase())
      .join(' ');
    return values.includes('에코디교회') || values.includes('church') || values.includes('교회');
  }

  function setGate(message, kind = 'waiting') {
    const gate = $('#churchAccessGate');
    const copy = $('#churchAccessMessage');
    if (copy) copy.textContent = message;
    if (gate) gate.dataset.state = kind;
    if (!churchAuthorized) document.body.dataset.churchAuthorized = 'false';
  }

  function authorize(context) {
    if (!churchContext(context)) {
      churchAuthorized = false;
      setGate('에코디교회 공간 권한이 확인되지 않았습니다. 마이 에코디에서 에코디교회 공간을 선택한 뒤 다시 들어와 주세요.', 'denied');
      return;
    }
    churchAuthorized = true;
    document.body.dataset.churchAuthorized = 'true';
    document.body.dataset.churchWorkspaceRole = String(context?.role || 'member');
    const role = $('#churchAccessRole');
    if (role) role.textContent = String(context?.role || 'member');
  }

  window.addEventListener('ekodi:workspace-ready', event => authorize(event.detail || {}));
  window.addEventListener('ekodi:auth-ready', event => {
    if (!event.detail?.authenticated) {
      churchAuthorized = false;
      setGate('Google 로그인 후, 접근 권한이 있는 에코디교회 공간에서 이용할 수 있습니다.', 'login');
      return;
    }
    if (window.EKODI_MARKETING_CONTEXT) authorize(window.EKODI_MARKETING_CONTEXT);
  });
  document.body.dataset.churchAuthorized = 'false';
  setGate('교회 공간 로그인과 권한을 확인하고 있습니다.', 'waiting');

  const drafts = () => {
    if (!churchAuthorized) return [];
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  };
  const save = rows => {
    if (!churchAuthorized) throw new Error('church_workspace_required');
    localStorage.setItem(KEY, JSON.stringify(rows.slice(-50)));
  };

  function setTab(id) {
    if (!churchAuthorized) return;
    $$('.tab').forEach(button => button.classList.toggle('active', button.dataset.tab === id));
    $$('.panel').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === id));
  }
  $$('.tab').forEach(button => button.addEventListener('click', () => setTab(button.dataset.tab)));

  function contentText() {
    if (!churchAuthorized) return '에코디교회 공간 권한 확인이 필요합니다.';
    const subject = safe($('#subject')?.value) || '에코디교회 소식';
    const source = safe($('#source')?.value);
    const type = $('#contentType')?.value || '예배·말씀';
    const tone = $('#tone')?.value || 'warm';
    const lead = tone === 'joy'
      ? '함께 웃고, 함께 누린 기쁨을 나눕니다! 🎉'
      : tone === 'clear'
        ? subject + ' 소식을 전합니다.'
        : '함께한 시간 속에서 감사와 은혜를 나눕니다.';
    const core = source ? source.slice(0, 340) : '예배와 말씀, 공동체의 소식을 함께 나눕니다.';
    return [
      '[YouTube]', subject + ' | ' + type, lead, core, '#에코디교회 #말씀 #공동체', '',
      '[Instagram]', lead, core, '#에코디교회 #함께 #공동체', '',
      '[Facebook]', subject, core, '함께해 주신 모든 분들께 감사드립니다.', '',
      '[Blog]', '제목: ' + subject, '요약: ' + core, '마무리: 모든 감사와 영광을 하나님께 올려드립니다.'
    ].join('\n');
  }

  $('#contentForm')?.addEventListener('submit', event => {
    event.preventDefault();
    if (!churchAuthorized) return setGate('에코디교회 공간 권한 확인이 필요합니다.', 'denied');
    $('#contentOutput').textContent = contentText();
  });

  $('#saveDraft')?.addEventListener('click', () => {
    if (!churchAuthorized) return setGate('에코디교회 공간 권한 확인이 필요합니다.', 'denied');
    const subject = safe($('#subject')?.value);
    if (!subject) {
      $('#contentOutput').textContent = '먼저 주제를 입력해 주세요.';
      return;
    }
    const rows = drafts();
    rows.push({ id: Date.now(), subject, body: contentText(), state: '초안', createdAt: new Date().toISOString() });
    save(rows);
    renderQueue();
    updateMetrics();
    $('#contentOutput').textContent = '초안을 저장했습니다. 승인 탭에서 상태를 진행할 수 있습니다.';
  });

  $('#makeVideoPlan')?.addEventListener('click', () => {
    if (!churchAuthorized) return setGate('에코디교회 공간 권한 확인이 필요합니다.', 'denied');
    const subject = safe($('#subject')?.value) || '에코디교회 소식';
    const seconds = Number($('#videoLength')?.value || 30);
    const mood = $('#videoMood')?.value || 'joy';
    const beats = seconds === 15
      ? ['0-3초 강한 첫 장면', '3-10초 핵심 순간 3컷', '10-15초 엔딩']
      : seconds === 60
        ? ['0-5초 오프닝', '5-20초 현장 분위기', '20-40초 핵심 장면', '40-52초 말씀·공동체 메시지', '52-60초 엔딩']
        : ['0-3초 오프닝', '3-12초 즐거운 핵심 장면', '12-22초 공동체·체험 장면', '22-27초 핵심 메시지', '27-30초 엔딩'];
    const ending = mood === 'joy' ? '함께여서 더 즐거웠습니다!' : '모든 감사와 영광을 하나님께 올려드립니다.';
    $('#videoOutput').textContent = [
      subject + ' · ' + seconds + '초 9:16', '',
      ...beats.map((text, index) => (index + 1) + '. ' + text), '',
      '자막 원칙: 한 화면 1문장, 8~14자 중심', '엔딩: ' + ending
    ].join('\n');
  });

  function renderQueue() {
    const host = $('#approvalQueue');
    if (!host) return;
    const rows = drafts();
    if (!rows.length) {
      host.innerHTML = '<div class="notice">저장된 초안이 없습니다. 콘텐츠 탭에서 홍보세트를 만들고 저장하세요.</div>';
      return;
    }
    host.innerHTML = rows.slice().reverse().map(row => (
      '<div class="queue-item" data-id="' + row.id + '">' +
        '<div><strong>' + escapeHtml(row.subject) + '</strong><small>' + new Date(row.createdAt).toLocaleString('ko-KR') + '</small></div>' +
        '<div><span class="state">' + escapeHtml(row.state) + '</span><button class="btn" type="button" data-next>다음 상태</button></div>' +
      '</div>'
    )).join('');
    host.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => {
      if (!churchAuthorized) return;
      const id = Number(button.closest('[data-id]')?.dataset.id);
      const all = drafts();
      const row = all.find(item => item.id === id);
      if (!row) return;
      const states = ['초안', '승인요청', '책임자 승인', '게시대기', '게시완료'];
      row.state = states[Math.min(states.indexOf(row.state) + 1, states.length - 1)];
      save(all);
      renderQueue();
      updateMetrics();
    }));
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    })[char]);
  }

  function updateMetrics() {
    const rows = drafts();
    if ($('#metricDrafts')) $('#metricDrafts').textContent = String(rows.length);
    if ($('#metricApproved')) $('#metricApproved').textContent = String(rows.filter(row => ['책임자 승인','게시대기','게시완료'].includes(row.state)).length);
  }

  renderQueue();
  updateMetrics();
})();
