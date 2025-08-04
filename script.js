// タスク管理ツールのメインJavaScriptファイル

class TaskManager {
    constructor() {
        console.log('TaskManagerコンストラクタ開始');
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.assignees = JSON.parse(localStorage.getItem('assignees')) || [];
        this.currentUser = null;
        console.log('保存されたタスク:', this.tasks);
        console.log('保存された担当者:', this.assignees);
        
        // テストデータがない場合は作成
        if (this.tasks.length === 0) {
            this.createTestData();
        }
        
        this.init();
    }

    // テストデータ作成
    createTestData() {
        console.log('テストデータを作成します');
        
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const testTasks = [
            {
                id: '1',
                name: 'プロジェクトA',
                description: 'テストプロジェクトA',
                assignee: '田中太郎',
                priority: 3,
                estimatedHours: 20,
                deadline: nextWeek.toISOString(),
                parentTaskId: null,
                childTaskId: null,
                progress: 30,
                memoHistory: [],
                createdAt: now.toISOString(),
                updatedAt: now.toISOString()
            },
            {
                id: '2',
                name: '子タスクA-1',
                description: 'プロジェクトAの子タスク1',
                assignee: '佐藤花子',
                priority: 4,
                estimatedHours: 8,
                deadline: tomorrow.toISOString(),
                parentTaskId: '1',
                childTaskId: null,
                progress: 50,
                memoHistory: [],
                createdAt: now.toISOString(),
                updatedAt: now.toISOString()
            },
            {
                id: '3',
                name: '孫タスクA-1-1',
                description: '子タスクA-1の孫タスク',
                assignee: '鈴木一郎',
                priority: 5,
                estimatedHours: 4,
                deadline: tomorrow.toISOString(),
                parentTaskId: '2',
                childTaskId: null,
                progress: 80,
                memoHistory: [],
                createdAt: now.toISOString(),
                updatedAt: now.toISOString()
            },
            {
                id: '4',
                name: '子タスクA-2',
                description: 'プロジェクトAの子タスク2',
                assignee: '高橋美咲',
                priority: 3,
                estimatedHours: 12,
                deadline: nextWeek.toISOString(),
                parentTaskId: '1',
                childTaskId: null,
                progress: 20,
                memoHistory: [],
                createdAt: now.toISOString(),
                updatedAt: now.toISOString()
            },
            {
                id: '5',
                name: 'プロジェクトB',
                description: 'テストプロジェクトB',
                assignee: '山田次郎',
                priority: 2,
                estimatedHours: 15,
                deadline: nextWeek.toISOString(),
                parentTaskId: null,
                childTaskId: null,
                progress: 60,
                memoHistory: [],
                createdAt: now.toISOString(),
                updatedAt: now.toISOString()
            }
        ];
        
        this.tasks = testTasks;
        this.saveTasks();
        console.log('テストデータを作成しました:', this.tasks);
    }

    init() {
        console.log('TaskManager初期化開始');
        this.setupEventListeners();
        this.setupChildTaskEvents();
        this.renderTasks();
        this.renderAssignees();
        this.loadCurrentUser();
        console.log('TaskManager初期化完了');
    }

    setupEventListeners() {
        // 新規作成ボタン
        document.getElementById('createTaskBtn').addEventListener('click', () => {
            this.showCreateModal();
        });

        // 設定ボタン
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettingsModal();
        });

        // モーダル閉じるボタン
        document.getElementById('closeCreateModal').addEventListener('click', () => {
            this.hideModal('createTaskModal');
        });

        document.getElementById('closeDetailModal').addEventListener('click', () => {
            this.hideModal('taskDetailModal');
        });

        document.getElementById('closeSettingsModal').addEventListener('click', () => {
            this.hideModal('settingsModal');
        });

        // キャンセルボタン
        document.getElementById('cancelCreate').addEventListener('click', () => {
            this.hideModal('createTaskModal');
        });

        // フォーム送信
        document.getElementById('createTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTask();
        });

        // メモ更新ボタン
        document.getElementById('updateMemoBtn').addEventListener('click', () => {
            this.updateMemo();
        });

        // 担当者追加ボタン
        document.getElementById('addAssigneeBtn').addEventListener('click', () => {
            this.addAssignee();
        });

        // 進捗度変更
        document.getElementById('detailProgress').addEventListener('input', (e) => {
            this.updateProgress(e.target.value);
        });

        // モーダル外クリックで閉じる
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    // モーダル表示
    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    // モーダル非表示
    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // 新規作成モーダル表示
    showCreateModal() {
        this.populateAssigneeSelect();
        this.populateParentTaskSelect();
        this.populateChildTaskSelect();
        this.showModal('createTaskModal');
    }

    // 設定モーダル表示
    showSettingsModal() {
        this.renderAssigneeList();
        this.showModal('settingsModal');
    }

    // 担当者セレクトボックスを更新
    populateAssigneeSelect() {
        const select = document.getElementById('assignee');
        select.innerHTML = '<option value="">選択してください</option>';
        
        this.assignees.forEach(assignee => {
            const option = document.createElement('option');
            option.value = assignee.name;
            option.textContent = assignee.name;
            select.appendChild(option);
        });
    }

    // 親タスクセレクトボックスを更新
    populateParentTaskSelect() {
        const select = document.getElementById('parentTask');
        select.innerHTML = '<option value="">無し</option>';
        
        this.tasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.name;
            select.appendChild(option);
        });
    }

    // 子タスクセレクトボックスを更新
    populateChildTaskSelect() {
        const select = document.getElementById('childTask');
        select.innerHTML = '<option value="">無し</option>';
        
        this.tasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.name;
            select.appendChild(option);
        });
    }

    // タスク作成
    createTask() {
        const formData = new FormData(document.getElementById('createTaskForm'));
        
        const task = {
            id: Date.now().toString(),
            name: document.getElementById('taskName').value,
            description: document.getElementById('taskDescription').value,
            assignee: document.getElementById('assignee').value,
            priority: 3, // デフォルト値（自動計算されるため使用されない）
            estimatedHours: parseFloat(document.getElementById('estimatedHours').value) || 0,
            deadline: document.getElementById('deadline').value,
            parentTaskId: document.getElementById('parentTask').value || null,
            childTaskId: document.getElementById('childTask').value || null,
            progress: 0,
            memoHistory: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log('作成されたタスク:', task);
        console.log('親タスクID:', task.parentTaskId);
        console.log('子タスクID:', task.childTaskId);

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.hideModal('createTaskModal');
        document.getElementById('createTaskForm').reset();
    }

    // タスク表示
    renderTasks() {
        const projectsContainer = document.getElementById('projectsContainer');
        const completedContainer = document.getElementById('completedContainer');
        
        projectsContainer.innerHTML = '';
        completedContainer.innerHTML = '';

        // プロジェクト（最上位タスク）を取得してソート
        const projects = this.tasks.filter(task => !task.parentTaskId);
        
        // 優先度と残日数でソート
        projects.sort((a, b) => {
            const aHours = this.calculateTotalHours(a.id);
            const bHours = this.calculateTotalHours(b.id);
            const aRemaining = this.calculateRemainingDays(a.deadline);
            const bRemaining = this.calculateRemainingDays(b.deadline);
            
            const aPriority = this.calculateAutoPriority(aHours, aRemaining);
            const bPriority = this.calculateAutoPriority(bHours, bRemaining);
            
            // 優先度が高い順
            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }
            
            // 優先度が同じ場合は残日数が少ない順
            return aRemaining - bRemaining;
        });
        
        console.log('全タスク:', this.tasks);
        console.log('プロジェクト（最上位タスク）:', projects);
        
        projects.forEach(project => {
            const childTasks = this.getChildTasks(project.id);
            console.log(`プロジェクト "${project.name}" の子タスク:`, childTasks);
            
            const projectElement = this.createProjectElement(project);
            
            if (project.progress >= 100) {
                completedContainer.appendChild(projectElement);
            } else {
                projectsContainer.appendChild(projectElement);
            }
        });
    }

    // プロジェクト要素作成（階層表示付き）
    createProjectElement(project) {
        const projectElement = document.createElement('div');
        projectElement.className = `project-card ${project.progress >= 100 ? 'completed' : ''}`;
        projectElement.dataset.taskId = project.id;

        const latestDeadline = this.calculateLatestDeadline(project.id);
        const remainingDays = this.calculateRemainingDays(latestDeadline);
        const totalHours = this.calculateTotalHours(project.id);
        const totalProgress = this.calculateTotalProgress(project.id);
        const autoPriority = this.calculateAutoPriority(totalHours, remainingDays);

        // 子タスクを取得
        const childTasks = this.getChildTasks(project.id);

        projectElement.innerHTML = `
            <div class="project-row">
                <div class="project-name">${project.name}</div>
                <div class="project-assignee">${project.assignee || '未設定'}</div>
                <div class="project-hours">${totalHours}h</div>
                <div class="project-deadline">${this.formatDeadline(latestDeadline)}</div>
                <div class="project-remaining">${remainingDays}日</div>
                <div class="project-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${totalProgress}%"></div>
                    </div>
                    <div class="progress-text">${totalProgress}%</div>
                </div>
                <div class="project-priority priority-${autoPriority}">P${autoPriority}</div>
            </div>
            <div class="child-tasks" id="child-tasks-${project.id}">
                ${this.renderChildTasks(childTasks, 1)}
            </div>
        `;

        projectElement.addEventListener('click', (e) => {
            // プロジェクト行のみクリック可能
            if (e.target.closest('.project-row')) {
                this.showTaskDetail(project.id);
            }
        });

        return projectElement;
    }

    // 子タスクのクリックイベントを設定
    setupChildTaskEvents() {
        document.addEventListener('click', (e) => {
            const childTask = e.target.closest('.child-task');
            if (childTask) {
                const taskId = childTask.dataset.taskId;
                this.showTaskDetail(taskId);
            }
        });
    }

    // 子タスクを取得
    getChildTasks(parentId) {
        const childTasks = this.tasks.filter(task => task.parentTaskId === parentId);
        console.log(`親タスクID ${parentId} の子タスク:`, childTasks);
        return childTasks;
    }

    // 子タスクを階層表示（横1行表示）
    renderChildTasks(childTasks, level = 1) {
        console.log(`renderChildTasks呼び出し: level=${level}, childTasks=`, childTasks);
        
        if (childTasks.length === 0) {
            console.log(`level ${level}: 子タスクなし`);
            return '';
        }

        let html = '';
        childTasks.forEach(child => {
            console.log(`level ${level}: 子タスク処理中:`, child.name);
            
            const childLatestDeadline = this.calculateLatestDeadline(child.id);
            const childRemainingDays = this.calculateRemainingDays(childLatestDeadline);
            const childTotalHours = this.calculateTotalHours(child.id);
            const childTotalProgress = this.calculateTotalProgress(child.id);
            const childAutoPriority = this.calculateAutoPriority(childTotalHours, childRemainingDays);
            const grandChildTasks = this.getChildTasks(child.id);

            html += `
                <div class="child-task level-${level}" data-task-id="${child.id}">
                    <div class="child-task-row">
                        <div class="child-task-name">${child.name}</div>
                        <div class="child-task-assignee">${child.assignee || '未設定'}</div>
                        <div class="child-task-hours">${childTotalHours}h</div>
                        <div class="child-task-deadline">${this.formatDeadline(childLatestDeadline)}</div>
                        <div class="child-task-remaining">${childRemainingDays}日</div>
                        <div class="child-task-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${childTotalProgress}%"></div>
                            </div>
                            <div class="progress-text">${childTotalProgress}%</div>
                        </div>
                        <div class="child-task-priority priority-${childAutoPriority}">P${childAutoPriority}</div>
                    </div>
                    ${this.renderChildTasks(grandChildTasks, level + 1)}
                </div>
            `;
        });

        console.log(`level ${level}: 生成されたHTML:`, html);
        return html;
    }

    // タスク要素作成
    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-card ${task.progress >= 100 ? 'completed' : ''}`;
        taskElement.dataset.taskId = task.id;

        const remainingDays = this.calculateRemainingDays(task.deadline);
        const totalHours = this.calculateTotalHours(task.id);
        const totalProgress = this.calculateTotalProgress(task.id);

        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-name">${task.name}</div>
                <div class="task-priority priority-${task.priority}">P${task.priority}</div>
            </div>
            <div class="task-info">
                <span><i class="fas fa-user"></i> ${task.assignee || '未設定'}</span>
                <span><i class="fas fa-clock"></i> ${totalHours}h</span>
                <span><i class="fas fa-calendar"></i> ${this.formatDeadline(task.deadline)}</span>
                <span><i class="fas fa-calendar-day"></i> 残${remainingDays}日</span>
            </div>
            <div class="task-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${totalProgress}%"></div>
                </div>
                <div class="progress-text">${totalProgress}%</div>
            </div>
        `;

        taskElement.addEventListener('click', () => {
            this.showTaskDetail(task.id);
        });

        return taskElement;
    }

    // タスク詳細表示
    showTaskDetail(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const remainingDays = this.calculateRemainingDays(task.deadline);
        const totalHours = this.calculateTotalHours(taskId);
        const totalProgress = this.calculateTotalProgress(taskId);

        // 詳細情報を設定
        document.getElementById('detailTaskName').textContent = task.name;
        document.getElementById('detailAssignee').textContent = task.assignee || '-';
        document.getElementById('detailPriority').textContent = `P${task.priority}`;
        document.getElementById('detailHours').textContent = `${totalHours}h`;
        document.getElementById('detailDeadline').textContent = this.formatDeadline(task.deadline);
        document.getElementById('detailRemainingDays').textContent = `${remainingDays}日`;
        document.getElementById('detailDescription').textContent = task.description || '-';
        
        // 進捗度設定
        const progressInput = document.getElementById('detailProgress');
        const progressValue = document.getElementById('progressValue');
        
        progressInput.value = totalProgress;
        progressValue.textContent = `${totalProgress}%`;
        
        // 最下層タスクのみ進捗度を編集可能にする
        const hasChildren = this.tasks.some(t => t.parentTaskId === taskId);
        progressInput.disabled = hasChildren;

        // メモ履歴表示
        this.renderMemoHistory(taskId);

        this.showModal('taskDetailModal');
        this.currentTaskId = taskId;
    }

    // メモ履歴表示
    renderMemoHistory(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        const memoHistory = document.getElementById('memoHistory');
        
        memoHistory.innerHTML = '';
        
        if (task.memoHistory && task.memoHistory.length > 0) {
            task.memoHistory.forEach(memo => {
                const memoElement = document.createElement('div');
                memoElement.className = 'memo-entry';
                memoElement.innerHTML = `
                    <div class="memo-header">
                        <span class="memo-author">${memo.author}</span>
                        <span class="memo-date">${this.formatDateTime(memo.timestamp)}</span>
                    </div>
                    <div class="memo-content">${memo.content}</div>
                `;
                memoHistory.appendChild(memoElement);
            });
        }
    }

    // メモ更新
    updateMemo() {
        const content = document.getElementById('memoInput').value.trim();
        if (!content) return;

        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (!task) return;

        const memo = {
            content: content,
            author: this.currentUser || '匿名',
            timestamp: new Date().toISOString()
        };

        if (!task.memoHistory) {
            task.memoHistory = [];
        }
        task.memoHistory.push(memo);

        this.saveTasks();
        this.renderMemoHistory(this.currentTaskId);
        document.getElementById('memoInput').value = '';
    }

    // 進捗度更新
    updateProgress(progress) {
        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (!task) return;

        // 最下層タスクのみ進捗度を更新可能
        const hasChildren = this.tasks.some(t => t.parentTaskId === this.currentTaskId);
        if (hasChildren) return;

        task.progress = parseInt(progress);
        task.updatedAt = new Date().toISOString();

        this.saveTasks();
        this.renderTasks();
        
        document.getElementById('progressValue').textContent = `${progress}%`;
    }

    // 担当者リスト表示
    renderAssigneeList() {
        const assigneeList = document.getElementById('assigneeList');
        assigneeList.innerHTML = '';

        this.assignees.forEach(assignee => {
            const assigneeElement = document.createElement('div');
            assigneeElement.className = 'assignee-item';
            assigneeElement.innerHTML = `
                <div class="assignee-info">
                    <div class="assignee-name">${assignee.name}</div>
                    <div class="assignee-github">@${assignee.github}</div>
                </div>
                <div class="assignee-actions">
                    <button class="btn btn-small btn-danger" onclick="taskManager.removeAssignee('${assignee.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            assigneeList.appendChild(assigneeElement);
        });
    }

    // 担当者追加
    addAssignee() {
        const name = document.getElementById('newAssigneeName').value.trim();
        const github = document.getElementById('newAssigneeGithub').value.trim();

        if (!name || !github) {
            alert('表示名とGitHubユーザー名を入力してください。');
            return;
        }

        const assignee = {
            id: Date.now().toString(),
            name: name,
            github: github
        };

        this.assignees.push(assignee);
        this.saveAssignees();
        this.renderAssigneeList();
        this.populateAssigneeSelect();
        this.addUserSelector(); // ユーザー選択UIを更新

        document.getElementById('newAssigneeName').value = '';
        document.getElementById('newAssigneeGithub').value = '';
    }

    // 担当者削除
    removeAssignee(assigneeId) {
        if (confirm('この担当者を削除しますか？')) {
            this.assignees = this.assignees.filter(a => a.id !== assigneeId);
            this.saveAssignees();
            this.renderAssigneeList();
            this.populateAssigneeSelect();
            this.addUserSelector(); // ユーザー選択UIを更新
        }
    }

    // 担当者表示更新
    renderAssignees() {
        this.populateAssigneeSelect();
    }

    // 現在のユーザー読み込み
    loadCurrentUser() {
        // GitHub Pagesでは現在のユーザーを取得できないため、
        // 設定された担当者から選択できるようにする
        if (this.assignees.length > 0) {
            this.currentUser = this.assignees[0].name;
        }
        
        // ユーザー選択UIを追加
        this.addUserSelector();
    }

    // ユーザー選択UIを追加
    addUserSelector() {
        const header = document.querySelector('.header-controls');
        if (header && this.assignees.length > 0) {
            const userSelector = document.createElement('div');
            userSelector.className = 'user-selector';
            userSelector.innerHTML = `
                <select id="currentUserSelect" class="user-select">
                    ${this.assignees.map(assignee => 
                        `<option value="${assignee.name}" ${assignee.name === this.currentUser ? 'selected' : ''}>
                            ${assignee.name}
                        </option>`
                    ).join('')}
                </select>
            `;
            
            header.insertBefore(userSelector, header.firstChild);
            
            // ユーザー変更イベント
            document.getElementById('currentUserSelect').addEventListener('change', (e) => {
                this.currentUser = e.target.value;
            });
        }
    }

    // 残日数計算
    calculateRemainingDays(deadline) {
        if (!deadline) return '-';
        
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? diffDays : 0;
    }

    // 自動優先度計算
    calculateAutoPriority(hours, remainingDays) {
        if (remainingDays === '-' || remainingDays === 0) return 5;
        
        const ratio = hours / remainingDays;
        
        if (ratio < 0.1) return 1;
        if (ratio < 0.5) return 2;
        if (ratio < 1) return 3;
        if (ratio < 3) return 4;
        return 5;
    }

    // 最遅期限計算（子タスク含む）
    calculateLatestDeadline(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return null;

        let latestDeadline = task.deadline;
        
        // 子タスクの最遅期限を取得
        const childTasks = this.getChildTasks(taskId);
        childTasks.forEach(child => {
            const childDeadline = this.calculateLatestDeadline(child.id);
            if (childDeadline && (!latestDeadline || new Date(childDeadline) > new Date(latestDeadline))) {
                latestDeadline = childDeadline;
            }
        });

        return latestDeadline;
    }

    // 総所要時間計算（子タスク含む）
    calculateTotalHours(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return 0;

        // 子タスクがある場合は子タスクの合計
        const childTasks = this.tasks.filter(t => t.parentTaskId === taskId);
        if (childTasks.length > 0) {
            return childTasks.reduce((sum, child) => sum + this.calculateTotalHours(child.id), 0);
        }

        return task.estimatedHours || 0;
    }

    // 総進捗度計算（子タスク含む）
    calculateTotalProgress(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return 0;

        // 子タスクがある場合は重み付き平均
        const childTasks = this.tasks.filter(t => t.parentTaskId === taskId);
        if (childTasks.length > 0) {
            let totalWeightedProgress = 0;
            let totalHours = 0;

            childTasks.forEach(child => {
                const childHours = this.calculateTotalHours(child.id);
                const childProgress = this.calculateTotalProgress(child.id);
                totalWeightedProgress += childHours * childProgress;
                totalHours += childHours;
            });

            return totalHours > 0 ? Math.round(totalWeightedProgress / totalHours) : 0;
        }

        return task.progress || 0;
    }

    // 期限フォーマット
    formatDeadline(deadline) {
        if (!deadline) return '-';
        
        const date = new Date(deadline);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const weekday = weekdays[date.getDay()];
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${month}月${day}日（${weekday}）${hours}:${minutes}`;
    }

    // 日時フォーマット
    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const weekday = weekdays[date.getDay()];
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${month}/${day}（${weekday}）${hours}:${minutes}`;
    }

    // データ保存
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    saveAssignees() {
        localStorage.setItem('assignees', JSON.stringify(this.assignees));
    }
}

// DOM読み込み完了後の初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM読み込み完了 ===');
    console.log('document ready:', document.readyState);
    
    // アプリケーション初期化
    console.log('スクリプト読み込み開始');
    try {
        const taskManager = new TaskManager();
        console.log('TaskManagerインスタンス作成完了');
    } catch (error) {
        console.error('TaskManager初期化エラー:', error);
    }
    
    console.log('=== 初期化完了 ===');
});

// 基本的なテスト
console.log('=== 基本的なテスト開始 ===');
console.log('document ready:', document.readyState);
console.log('window loaded:', window.onload);
console.log('=== 基本的なテスト完了 ==='); 