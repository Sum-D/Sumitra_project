(function(){
  const STORAGE_KEY = 'sf_todo_v1';
  let state = { tasks: [] };

  const uid = () => Date.now() + Math.floor(Math.random()*1000);

  function loadInitial(){
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved){
      state = JSON.parse(saved);
      document.getElementById('saved').textContent = 'Loaded from localStorage';
      render();
      return;
    }
    fetch('data.json')
      .then(r=>r.json())
      .then(d=>{ state = d; render(); });
  }

  function persist(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.getElementById('saved').textContent = 'Saved to localStorage';
    render();
  }

  const listEl = document.getElementById('tasks');
  const input = document.getElementById('task-input');
  const addBtn = document.getElementById('add-btn');
  const exportBtn = document.getElementById('export-btn');
  const clearBtn = document.getElementById('clear-btn');
  const countEl = document.getElementById('count');

  function render(){
    listEl.innerHTML = '';
    if(!state.tasks.length){ countEl.textContent = '0 tasks'; return; }
    state.tasks.forEach(t => {
      const li = document.createElement('li');
      li.className = 'task';
      const title = document.createElement('div');
      title.className = 'title' + (t.done ? ' done' : '');
      title.textContent = t.title;
      const actions = document.createElement('div');
      const toggle = document.createElement('button'); 
      toggle.textContent = t.done ? 'Undo' : 'Done'; toggle.className='ghost';
      toggle.addEventListener('click', ()=>{ t.done = !t.done; persist(); });
      const del = document.createElement('button'); 
      del.textContent = 'Delete'; del.className='ghost';
      del.addEventListener('click', ()=>{ state.tasks = state.tasks.filter(x=>x.id !== t.id); persist(); });
      actions.appendChild(toggle); actions.appendChild(del);
      li.appendChild(title); li.appendChild(actions);
      listEl.appendChild(li);
    });
    countEl.textContent = state.tasks.length + ' tasks';
  }

  function addTask(title){
    const trimmed = title.trim();
    if(!trimmed) return;
    state.tasks.unshift({id: uid(), title: trimmed, done:false});
    persist();
  }

  function exportJSON(){
    const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'tasks.json'; a.click();
    URL.revokeObjectURL(url);
  }

  addBtn.addEventListener('click', ()=>{ addTask(input.value); input.value=''; });
  input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ addTask(input.value); input.value=''; }});
  exportBtn.addEventListener('click', exportJSON);
  clearBtn.addEventListener('click', ()=>{ if(confirm('Clear all tasks?')){ state.tasks = []; persist(); }});

  loadInitial();
})();
