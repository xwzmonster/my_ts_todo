import "./style.css";

// 1. 【定规矩】Interface (接口)
// 告诉 TS：我们列表里的每一个“任务”，必须长这样。
// 必须有 id (数字)，有 title (文字)，有 completed (布尔值)
// 如果少一个，TS 就会报错提醒你。
interface Todo {
  id: number;      // 注意：这里用小写 number
  title: string;
  completed: boolean;
  completedTime?: string;
  modifiedTime ?: string;
}

// 2. 【找元素】获取 HTML 里的标签
// "as HTMLInputElement" 是在告诉 TS：“兄弟，相信我，这肯定是个输入框”。
// 否则 TS 会担心：“万一它是个图片，图片可没有 .value 属性啊”。
const todoInput = document.querySelector('#todo-input') as HTMLInputElement;
const addBtn = document.querySelector('#add-btn') as HTMLButtonElement;
const todoListElement = document.querySelector('#todo-list') as HTMLUListElement;

// 定义一个空数组，用来存我们的任务数据。
// Todo[] 的意思是：这个数组里只能放符合上面那个“规矩”的东西。
let todos: Todo[] = []; 

// 该变量用来记住“正在修改哪个任务”
// 如果是 null，说明是“添加模式”
// 如果是数字，说明是“修改模式”（存着那个任务的 id）
let editingId: number | null = null;

// 3. 【拿数据】Fetch API (找服务器要初始数据)
async function fetchTodos(){
  try {
    // await fetch: 就像点外卖，要等(await)外卖送到。
    const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=3');
    
    // await response.json(): 把外卖包装拆开，拿出里面的数据。
    // as Todo[]: 强行告诉 TS，这里面的数据就是我们要的 Todo 列表。
    const data = await response.json() as Todo[];
    
    // 把拿到的数据存到我们的变量里
    todos = data;
    
    // 数据拿到手了，赶紧画到屏幕上
    renderTodos();
  } catch (error) {
    console.error("哎呀，获取数据失败:", error);
  }
}

// 4. 【画页面】Render (把数据变成 HTML)
function renderTodos() {
  
  // 先把旧的列表擦干净，防止重复
  todoListElement.innerHTML = '';

  // 遍历 todos 数组，每一个任务(todo)都生成一段 HTML
  todos.forEach(todo => {
    // 创建一个 li 标签
    const li = document.createElement('li');

    // 如果任务完成了，就给 li 贴个标签(class)
    if(todo.completed){
      li.classList.add('completed');
    }
    // 动态决定按钮文字：是 "完成" 还是 "已完成"？
    const completeBtnText = todo.completed ? "已完成" : "完成";

    const modifiedTimeHtml = todo.modifiedTime ? `<span>更新于: ${todo.modifiedTime}</span>` : '';
    const completedTimeHtml = todo.completedTime ? `<span>完成于: ${todo.completedTime}</span>` : '';

    // 把它们包在一个 div 里
    const footerHtml = `
      <div class="todo-footer">
        ${modifiedTimeHtml}
        ${completedTimeHtml}
      </div>
    `;

    if(todo.id === editingId){
      li.innerHTML = `
        <input type="text" class="edit-input" value="${todo.title}">
        <div class="btn-group">
          <button class="save-btn" data-id="${todo.id}">保存</button>
          <button class="cancel-btn">取消</button>
        </div>
        ${footerHtml}
      `;
    } else{
      // 【普通状态】：显示文字 + 删除按钮 + 修改按钮
      // 设置 li 里面的内容：左边是标题，右边是删除按钮
      li.innerHTML = `
        <span>${todo.title}</span>
        <div class="btn-group">
          <button class="delete-btn" data-id="${todo.id}">删除</button>
          <button class="change-btn" data-id="${todo.id}">修改</button>
          <button class="complete-btn" data-id="${todo.id}">${completeBtnText}</button>
        </div>
        ${footerHtml}`;
    } 
    
    // 把做好的 li 塞进列表里
    todoListElement.appendChild(li);
  });

  // 按钮是新画出来的，必须重新给它们绑定点击事件，不然点不动
  bindEvents();
}

// 5. 【加任务】点击添加按钮
if (addBtn && todoInput) {
  addBtn.addEventListener('click', () => {
    const text = todoInput.value;
    if (!text.trim()) return; // 如果是空的，啥也不干
    
      
      // 按照接口的“规矩”，捏一个新的任务对象
      const newTodo: Todo = {
        id: Date.now(), // 用当前时间戳当 ID，保证不重复
        title: text,
        completed: false,
        modifiedTime: new Date().toLocaleString(),

      };
      todos.push(newTodo);  // 加进数组
    // 不管是改还是加，最后都要刷新页面 + 清空输入框
    renderTodos();        // 重新画页面
    todoInput.value = ''; // 清空输入框
  });

  // 监听键盘的 "Enter" 键
  todoInput.addEventListener('keydown', (e) =>{
    if(e.key === 'Enter'){
      addBtn.click();
    }
  })
}

// 6. 按钮功能
function bindEvents() {
  // 删除任务事项功能
  const deleteBtns = document.querySelectorAll('.delete-btn');
  
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      // 拿到按钮上藏着的 data-id
      const idToDelete = Number(target.getAttribute('data-id'));

      // 核心逻辑：filter (过滤)
      // 意思就是：留下那些 ID 不等于要删ID的任务
      todos = todos.filter(todo => todo.id !== idToDelete);
      
      // 数据变了，重新画页面
      renderTodos();
    });
  });

  // 修改任务事项逻辑
  const changeBtns = document.querySelectorAll('.change-btn');
  changeBtns.forEach(btn =>{
    btn.addEventListener('click', (e) =>{
      const target = e.target as HTMLElement;
      const id = Number(target.getAttribute('data-id'));
      editingId = id;
      renderTodos();
    })
  });

  // 保存修改事项逻辑
  const saveBtns = document.querySelectorAll('.save-btn');
  saveBtns.forEach(btn =>{
    btn.addEventListener('click', (e) =>{
      const target = e.target as HTMLElement;
      const id = Number(target.getAttribute('data-id'));

      // 1. 先找到按钮的爸爸 (div.btn-group)
      const btnGroup = target.parentElement as HTMLElement;
      // 2. 再找爸爸的上一个兄弟 (input)      
      // 找到那个输入框（它是按钮的“兄弟”元素）
      // previousElementSibling 就是“上一个兄弟”，也就是那个 input
      const input = btnGroup.previousElementSibling as HTMLInputElement;

      const newText = input.value;

      // 更新数据
      const todo = todos.find(t => t.id === id);
      if (todo && newText.trim()) {
        todo.title = newText;

        delete todo.completedTime; // 修改了内容，完成状态作废
        todo.completed = false;

        // 更新修改时间
        todo.modifiedTime = new Date().toLocaleString();
      }

      editingId = null; // 退出变身模式
      renderTodos();    // 重新画页面
    })
  })

  // 4. 取消按钮：啥也不改，直接退出
  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      editingId = null; // 退出变身模式
      renderTodos();    // 重新画页面（恢复原样）
    });
  });

  // 5. 完成按钮
  const completeBtn = document.querySelectorAll('.complete-btn')
  completeBtn.forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const target = e.target as HTMLElement;
      // 拿到按钮上藏着的 data-id
      const idToComplete = Number(target.getAttribute('data-id'));

      const todo = todos.find(t=> t.id === idToComplete);

      if(todo && todo.completed){
        return;
      }

      // 获取当前时间
      const nowTime = new Date();
      // toLocaleString 会生成类似 "2023/11/25 10:30:05" 这种格式
      const timeString = nowTime.toLocaleString();

      if(todo){
        // 把“完成状态”设为 true
        todo.completed = true;
        todo.completedTime = timeString; // 更新数据
        renderTodos(); // 重新渲染，让时间显示出来
      }
    })
  })

}

// 程序一启动，先去拿数据
fetchTodos();