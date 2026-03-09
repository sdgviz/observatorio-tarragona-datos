(function () {
  let agendasData = [];
  let municipiosData = [];
  let selectedAgendaId = '';
  let selectedCodigoIne = '';

  const agendaSelect = document.getElementById('agenda-select');
  const municipioSelect = document.getElementById('municipio-select');
  const hierarchyEl = document.getElementById('hierarchy');
  const municipioIndicatorsEl = document.getElementById('municipio-indicators');

  function getIndicadoresForMunicipio(codigoIne) {
    if (!codigoIne) return { ods: [], au: [], desc: [] };
    const m = municipiosData.find(function (x) { return x.codigo_ine === codigoIne; });
    return m ? { ods: m.ods || [], au: m.au || [], desc: m.desc || [] } : { ods: [], au: [], desc: [] };
  }

  function hasIndicatorInMunicipio(idIndicador, codigoIne) {
    const ind = getIndicadoresForMunicipio(codigoIne);
    if (selectedAgendaId === 'ods') return ind.ods.indexOf(idIndicador) !== -1;
    if (selectedAgendaId === 'au') return ind.au.indexOf(idIndicador) !== -1;
    if (selectedAgendaId === 'desc') return ind.desc.indexOf(idIndicador) !== -1;
    return false;
  }

  function renderTreeNode(node, codigoIne) {
    if (node.id_indicador !== undefined) {
      const has = codigoIne ? hasIndicatorInMunicipio(node.id_indicador, codigoIne) : false;
      const li = document.createElement('li');
      li.className = 'tree-node';
      const div = document.createElement('div');
      div.className = 'indicator-leaf' + (has ? ' has-in-municipio' : '');
      div.textContent = node.nombre;
      const span = document.createElement('span');
      span.className = 'indicator-id';
      span.textContent = node.id_indicador;
      div.appendChild(span);
      li.appendChild(div);
      return li;
    }
    const li = document.createElement('li');
    li.className = 'tree-node';
    const label = document.createElement('span');
    label.className = 'node-label';
    label.textContent = node.nombre;
    li.appendChild(label);
    if (node.children && node.children.length > 0) {
      const ul = document.createElement('ul');
      node.children.forEach(function (ch) {
        ul.appendChild(renderTreeNode(ch, codigoIne));
      });
      li.appendChild(ul);
    }
    return li;
  }

  function renderAgenda(agenda, codigoIne) {
    const frag = document.createDocumentFragment();
    const h2 = document.createElement('h2');
    h2.textContent = agenda.label;
    frag.appendChild(h2);
    if (agenda.tree && agenda.tree.children) {
      const ul = document.createElement('ul');
      ul.style.marginLeft = '0';
      ul.style.paddingLeft = '0';
      ul.style.listStyle = 'none';
      agenda.tree.children.forEach(function (ch) {
        ul.appendChild(renderTreeNode(ch, codigoIne));
      });
      frag.appendChild(ul);
    } else if (agenda.indicators && agenda.indicators.length > 0) {
      const ul = document.createElement('ul');
      ul.style.listStyle = 'none';
      ul.style.paddingLeft = '0';
      agenda.indicators.forEach(function (ind) {
        const li = document.createElement('li');
        const div = document.createElement('div');
        div.className = 'indicator-leaf' + (codigoIne && hasIndicatorInMunicipio(ind.id_indicador, codigoIne) ? ' has-in-municipio' : '');
        div.textContent = ind.nombre;
        const span = document.createElement('span');
        span.className = 'indicator-id';
        span.textContent = ind.id_indicador;
        div.appendChild(span);
        li.appendChild(div);
        ul.appendChild(li);
      });
      frag.appendChild(ul);
    } else {
      const p = document.createElement('p');
      p.textContent = 'No hay indicadores en esta agenda.';
      frag.appendChild(p);
    }
    hierarchyEl.innerHTML = '';
    hierarchyEl.appendChild(frag);
  }

  function updateMunicipioSummary() {
    if (!selectedCodigoIne) {
      municipioIndicatorsEl.innerHTML = '<h2>Municipio</h2><p>Elige un municipio para ver qué indicadores tiene disponibles en la agenda seleccionada.</p>';
      return;
    }
    const m = municipiosData.find(function (x) { return x.codigo_ine === selectedCodigoIne; });
    const name = m ? m.nombre : selectedCodigoIne;
    const ind = getIndicadoresForMunicipio(selectedCodigoIne);
    const list = selectedAgendaId === 'ods' ? ind.ods : selectedAgendaId === 'au' ? ind.au : ind.desc;
    municipioIndicatorsEl.innerHTML = '<h2>Indicadores en ' + name + '</h2><p>Total en esta agenda: ' + list.length + '</p>';
    if (list.length > 0) {
      const ul = document.createElement('ul');
      ul.style.fontSize = '0.9rem';
      list.forEach(function (id) {
        const li = document.createElement('li');
        li.textContent = id;
        ul.appendChild(li);
      });
      municipioIndicatorsEl.appendChild(ul);
    }
  }

  function onAgendaChange() {
    selectedAgendaId = agendaSelect.value || '';
    const agenda = agendasData.find(function (a) { return a.id === selectedAgendaId; });
    if (agenda) {
      renderAgenda(agenda, selectedCodigoIne);
    } else {
      hierarchyEl.innerHTML = '<p>Elige una agenda.</p>';
    }
    updateMunicipioSummary();
  }

  function onMunicipioChange() {
    selectedCodigoIne = municipioSelect.value || '';
    const agenda = agendasData.find(function (a) { return a.id === selectedAgendaId; });
    if (agenda) {
      renderAgenda(agenda, selectedCodigoIne);
    }
    updateMunicipioSummary();
  }

  function initSelects() {
    agendasData.forEach(function (a) {
      const opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = a.label;
      agendaSelect.appendChild(opt);
    });
    municipiosData.forEach(function (m) {
      const opt = document.createElement('option');
      opt.value = m.codigo_ine;
      opt.textContent = m.nombre + ' (' + m.codigo_ine + ')';
      municipioSelect.appendChild(opt);
    });
    agendaSelect.addEventListener('change', onAgendaChange);
    municipioSelect.addEventListener('change', onMunicipioChange);
  }

  function loadData() {
    Promise.all([
      fetch('data/agendas.json').then(function (r) { return r.json(); }),
      fetch('data/municipios.json').then(function (r) { return r.json(); })
    ]).then(function (results) {
      agendasData = results[0];
      municipiosData = results[1];
      initSelects();
      updateMunicipioSummary();
      hierarchyEl.textContent = 'Elige una agenda.';
    }).catch(function (err) {
      hierarchyEl.innerHTML = '<p>Error cargando datos: ' + err.message + '. Asegúrate de servir esta carpeta (p. ej. con un servidor local o GitHub Pages).</p>';
    });
  }

  loadData();
})();
