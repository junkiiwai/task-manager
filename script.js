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
                name: 'Instagram業種別投稿分析',
                description: 'Instagramでの業種別投稿分析プロジェクト',
                assignee: '岩井淳貴',
                priority: 3,
                estimatedHours: 25,
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
                name: 'Instagram業種別投稿分析（パン屋）',
                description: 'パン屋のInstagram投稿分析',
                assignee: '岩井淳貴',
                priority: 4,
                estimatedHours: 9,
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
                name: 'い',
                description: 'テストタスク',
                assignee: '未設定',
                priority: 5,
                estimatedHours: 9,
                deadline: tomorrow.toISOString(),
                parentTaskId: '2',
                childTaskId: null,
                progress: 0,
                memoHistory: [],
                createdAt: now.toISOString(),
                updatedAt: now.toISOString()
            },
            {
                id: '4',
                name: 'Instagram業種別投稿分析（カフェ）',
                description: 'カフェのInstagram投稿分析',
                assignee: '岩井淳貴',
                priority: 3,
                estimatedHours: 5,
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
                name: 'あ',
                description: 'テストタスク',
                assignee: '岩井淳貴',
                priority: 2,
                estimatedHours: 7,
                deadline: nextWeek.toISOString(),
                parentTaskId: '1',
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

        // 色選択イベント
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-option')) {
                // 選択状態をリセット
                document.querySelectorAll('.color-option').forEach(option => {
                    option.classList.remove('selected');
                });
                // 選択した色をアクティブにする
                e.target.classList.add('selected');
                document.getElementById('selectedColor').value = e.target.dataset.color;
            }
            
            // 編集用色選択イベント
            if (e.target.classList.contains('edit-color-option')) {
                // 選択状態をリセット
                document.querySelectorAll('.edit-color-option').forEach(option => {
                    option.classList.remove('selected');
                });
                // 選択した色をアクティブにする
                e.target.classList.add('selected');
                document.getElementById('editSelectedColor').value = e.target.dataset.color;
            }
        });

        // 進捗度変更
        document.getElementById('detailProgress').addEventListener('input', (e) => {
            this.updateProgress(e.target.value);
        });

        // 作業中ステータス変更
        document.getElementById('workingStatus').addEventListener('change', (e) => {
            this.updateWorkingStatus(e.target.checked);
        });

        // タスク削除ボタン
        document.getElementById('deleteTaskBtn').addEventListener('click', () => {
            this.deleteTask();
        });

        // 担当者編集保存・キャンセルボタンは showEditAssigneeForm で直接設定

        // 編集ボタン
        document.getElementById('editAssigneeBtn').addEventListener('click', () => {
            this.startEditAssignee();
        });

        document.getElementById('editHoursBtn').addEventListener('click', () => {
            this.startEditHours();
        });

        document.getElementById('editDeadlineBtn').addEventListener('click', () => {
            this.startEditDeadline();
        });

        // 保存ボタン
        document.getElementById('saveAssigneeBtn').addEventListener('click', () => {
            this.saveEditTaskAssignee();
        });

        document.getElementById('saveHoursBtn').addEventListener('click', () => {
            this.saveEditHours();
        });

        document.getElementById('saveDeadlineBtn').addEventListener('click', () => {
            this.saveEditDeadline();
        });

        // キャンセルボタン
        document.getElementById('cancelAssigneeBtn').addEventListener('click', () => {
            this.cancelEditTaskAssignee();
        });

        document.getElementById('cancelHoursBtn').addEventListener('click', () => {
            this.cancelEditHours();
        });

        document.getElementById('cancelDeadlineBtn').addEventListener('click', () => {
            this.cancelEditDeadline();
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

        // 子タスクの担当者を取得
        const childAssignees = this.getChildAssignees(project.id);
        const assigneeDisplay = childAssignees.length > 0 
            ? childAssignees.length === 1 
                ? childAssignees[0]
                : childAssignees.length === 2
                    ? `${childAssignees[0]}\n${childAssignees[1]}`
                    : `${childAssignees[0]}\n${childAssignees[1]}...`
            : project.assignee || '未設定';

        // 背景色を設定（優先順位: 100%完了 > 作業中）
        let taskStyle = '';
        if (totalProgress === 100) {
            // 100%完了の場合はより濃いグレー
            taskStyle = 'background-color: #adb5bd !important; color: #343a40 !important; opacity: 0.9 !important;';
        } else if (project.isWorking) {
            // 作業中の場合は担当者の色
            taskStyle = this.getWorkingTaskStyle(project.assignee);
        }

        projectElement.innerHTML = `
            <div class="task-row project-row" data-task-id="${project.id}" style="${taskStyle}">
                <div class="task-name">${project.name}</div>
                <div class="task-assignee">${assigneeDisplay}</div>
                <div class="task-hours">${totalHours}h</div>
                <div class="task-deadline">${this.formatDeadline(latestDeadline)}</div>
                <div class="task-remaining">残${remainingDays}日</div>
                <div class="task-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${totalProgress}%"></div>
                    </div>
                    <div class="progress-text">${totalProgress}%</div>
                </div>
                <div class="task-priority priority-${autoPriority}">優先度${autoPriority}</div>
            </div>
            ${this.renderChildTasks(childTasks, 1)}
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
            const childTaskRow = e.target.closest('.child-task-row');
            if (childTaskRow) {
                const taskId = childTaskRow.dataset.taskId;
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

    // 子タスクの担当者を取得（未設定を除く）
    getChildAssignees(parentId) {
        const childTasks = this.getChildTasks(parentId);
        const assignees = childTasks
            .map(task => task.assignee)
            .filter(assignee => assignee && assignee !== '未設定');
        
        // 重複を除去
        return [...new Set(assignees)];
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

            // 背景色を設定（優先順位: 100%完了 > 作業中）
            let childTaskStyle = '';
            if (childTotalProgress === 100) {
                // 100%完了の場合はより濃いグレー
                childTaskStyle = 'background-color: #adb5bd !important; color: #343a40 !important; opacity: 0.9 !important;';
            } else if (child.isWorking) {
                // 作業中の場合は担当者の色
                childTaskStyle = this.getWorkingTaskStyle(child.assignee);
            }

            html += `
                <div class="task-row child-task-row level-${level}" data-task-id="${child.id}" style="${childTaskStyle}">
                    <div class="task-name">${child.name}</div>
                    <div class="task-assignee">${child.assignee || '未設定'}</div>
                    <div class="task-hours">${childTotalHours}h</div>
                    <div class="task-deadline">${this.formatDeadline(childLatestDeadline)}</div>
                    <div class="task-remaining">残${childRemainingDays}日</div>
                    <div class="task-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${childTotalProgress}%"></div>
                        </div>
                        <div class="progress-text">${childTotalProgress}%</div>
                    </div>
                    <div class="task-priority priority-${childAutoPriority}">優先度${childAutoPriority}</div>
                </div>
                ${this.renderChildTasks(grandChildTasks, level + 1)}
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

        // 作業中ステータス設定（子タスクを持つ場合または100%完了の場合は非表示）
        const workingStatus = document.getElementById('workingStatus');
        const workingStatusContainer = workingStatus.closest('.info-row');
        
        if (hasChildren || totalProgress === 100) {
            // 子タスクを持つ場合または100%完了の場合は非表示
            workingStatusContainer.style.display = 'none';
            // 100%完了の場合は作業中フラグもクリア
            if (totalProgress === 100 && task.isWorking) {
                task.isWorking = false;
                this.saveTasks();
            }
        } else {
            // 子タスクを持たず、完了していない場合は表示
            workingStatusContainer.style.display = 'block';
            workingStatus.checked = task.isWorking || false;
        }

        // 編集ボタンの表示制御（子タスクを持つ場合は非表示）
        const editAssigneeBtn = document.getElementById('editAssigneeBtn');
        const editHoursBtn = document.getElementById('editHoursBtn');
        const editDeadlineBtn = document.getElementById('editDeadlineBtn');
        
        if (hasChildren) {
            // 子タスクを持つ場合は編集ボタンを非表示
            editAssigneeBtn.style.display = 'none';
            editHoursBtn.style.display = 'none';
            editDeadlineBtn.style.display = 'none';
        } else {
            // 子タスクを持たない場合は編集ボタンを表示
            editAssigneeBtn.style.display = 'inline-block';
            editHoursBtn.style.display = 'inline-block';
            editDeadlineBtn.style.display = 'inline-block';
        }

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

    // 作業中ステータス更新
    updateWorkingStatus(isWorking) {
        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (!task) return;

        if (isWorking) {
            // 作業中にする場合、同じ担当者の他のタスクの作業中を解除
            this.tasks.forEach(t => {
                if (t.id !== this.currentTaskId && t.assignee === task.assignee && t.isWorking) {
                    t.isWorking = false;
                }
            });
        }

        task.isWorking = isWorking;
        task.updatedAt = new Date().toISOString();

        this.saveTasks();
        this.renderTasks();
    }

    // 作業中タスクのスタイルを取得
    getWorkingTaskStyle(assigneeName) {
        if (!assigneeName || assigneeName === '未設定') {
            return '';
        }
        
        const assignee = this.assignees.find(a => a.name === assigneeName);
        
        if (!assignee) {
            return '';
        }
        
        // 色が設定されていない場合はデフォルト色を設定
        if (!assignee.color) {
            assignee.color = '#e3f2fd'; // デフォルトの淡い青
            this.saveAssignees();
        }
        
        return `background-color: ${assignee.color} !important; border-left-color: ${assignee.color} !important;`;
    }

    // タスク削除
    deleteTask() {
        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (!task) return;

        // 子タスクがある場合は削除を防ぐ
        const hasChildren = this.tasks.some(t => t.parentTaskId === this.currentTaskId);
        if (hasChildren) {
            alert('子タスクがあるタスクは削除できません。先に子タスクを削除してください。');
            return;
        }

        // 確認ダイアログ
        if (!confirm(`タスク「${task.name}」を削除しますか？\nこの操作は取り消せません。`)) {
            return;
        }

        // タスクを削除
        this.tasks = this.tasks.filter(t => t.id !== this.currentTaskId);
        
        // 他のタスクの親子関係を更新（削除されたタスクを参照していた場合）
        this.tasks.forEach(t => {
            if (t.parentTaskId === this.currentTaskId) {
                t.parentTaskId = null;
            }
            if (t.childTaskId === this.currentTaskId) {
                t.childTaskId = null;
            }
        });

        this.saveTasks();
        this.renderTasks();
        this.hideModal('taskDetailModal');
        
        alert('タスクが削除されました。');
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
                    <button class="btn btn-small" onclick="taskManager.editAssignee('${assignee.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
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
        const color = document.getElementById('selectedColor').value;

        if (!name || !github) {
            alert('表示名とGitHubユーザー名を入力してください。');
            return;
        }

        const assignee = {
            id: Date.now().toString(),
            name: name,
            github: github,
            color: color
        };

        this.assignees.push(assignee);
        this.saveAssignees();
        this.renderAssigneeList();
        this.populateAssigneeSelect();
        this.addUserSelector(); // ユーザー選択UIを更新

        document.getElementById('newAssigneeName').value = '';
        document.getElementById('newAssigneeGithub').value = '';
        // 色選択をリセット
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector('.color-option[data-color="#e3f2fd"]').classList.add('selected');
        document.getElementById('selectedColor').value = '#e3f2fd';
    }

    // 担当者編集
    editAssignee(assigneeId) {
        const assignee = this.assignees.find(a => a.id === assigneeId);
        if (!assignee) return;

        // 編集フォームを表示
        this.showEditAssigneeForm(assignee);
    }

    // 担当者編集フォーム表示
    showEditAssigneeForm(assignee) {
        console.log('編集フォーム表示:', assignee);
        
        // 編集フォーム入力値を設定
        document.getElementById('editAssigneeName').value = assignee.name || '';
        document.getElementById('editAssigneeGithub').value = assignee.github || '';
        
        // 色選択をリセットして現在の色を選択
        document.querySelectorAll('.edit-color-option').forEach(option => {
            option.classList.remove('selected');
        });
        const currentColor = assignee.color || '#e3f2fd';
        const currentColorOption = document.querySelector(`.edit-color-option[data-color="${currentColor}"]`);
        if (currentColorOption) {
            currentColorOption.classList.add('selected');
        }
        document.getElementById('editSelectedColor').value = currentColor;
        
        // 編集中の担当者IDを保存
        this.editingAssigneeId = assignee.id;
        console.log('編集中の担当者ID:', this.editingAssigneeId);
        
        // 編集フォームを表示
        document.getElementById('editAssigneeForm').style.display = 'block';
        document.getElementById('addAssigneeForm').style.display = 'none';
        
        // 保存・キャンセルボタンのイベントリスナーを確実に設定
        setTimeout(() => {
            const saveBtn = document.getElementById('saveEditAssigneeBtn');
            const cancelBtn = document.getElementById('cancelEditAssigneeBtn');
            
            console.log('ボタン検索結果:', { saveBtn, cancelBtn });
            
            if (saveBtn) {
                // 直接onclickで設定（最も確実）
                saveBtn.onclick = (e) => {
                    e.preventDefault();
                    console.log('=== 保存ボタン直接onclick実行 ===');
                    try {
                        this.saveEditAssignee();
                    } catch (error) {
                        console.error('saveEditAssignee実行エラー:', error);
                    }
                };
                console.log('保存ボタンのonclick設定完了');
            } else {
                console.error('保存ボタンが見つかりません');
            }
            
            if (cancelBtn) {
                cancelBtn.onclick = (e) => {
                    e.preventDefault();
                    console.log('=== キャンセルボタン直接onclick実行 ===');
                    this.cancelEditAssignee();
                };
                console.log('キャンセルボタンのonclick設定完了');
            } else {
                console.error('キャンセルボタンが見つかりません');
            }
        }, 200);
    }

    // 担当者編集保存
    saveEditAssignee() {
        console.log('%c=== saveEditAssignee関数開始 ===', 'color: green; font-size: 16px; font-weight: bold;');
        console.log('保存開始、編集中ID:', this.editingAssigneeId);
        console.log('this:', this);
        console.log('assignees:', this.assignees);
        
        // 関数の最初でreturnして、ここまで到達するかテスト
        console.log('saveEditAssignee関数内の最初の処理に到達');
        
        // デバッグ：ここで一度returnして関数が呼ばれているかだけを確認
        // return 'debug_test_reached';
        
        const assignee = this.assignees.find(a => a.id === this.editingAssigneeId);
        if (!assignee) {
            console.error('担当者が見つかりません:', this.editingAssigneeId);
            alert('エラー: 担当者が見つかりません。');
            return;
        }

        const name = document.getElementById('editAssigneeName').value.trim();
        const github = document.getElementById('editAssigneeGithub').value.trim();
        const color = document.getElementById('editSelectedColor').value;

        console.log('入力値:', { name, github, color });

        if (!name || !github) {
            alert('表示名とGitHubユーザー名は必須です。');
            return;
        }

        assignee.name = name;
        assignee.github = github;
        assignee.color = color;

        console.log('更新後の担当者:', assignee);

        this.saveAssignees();
        this.renderAssigneeList();
        this.populateAssigneeSelect();
        this.addUserSelector(); // ユーザー選択UIを更新
        
        // タスクを再レンダリングして背景色を更新
        this.renderTasks();
        
        // 編集フォームを隠す
        this.hideEditAssigneeForm();
        
        console.log('保存完了');
    }

    // 担当者編集キャンセル
    cancelEditAssignee() {
        this.hideEditAssigneeForm();
    }

    // 編集フォームを隠す
    hideEditAssigneeForm() {
        document.getElementById('editAssigneeForm').style.display = 'none';
        document.getElementById('addAssigneeForm').style.display = 'block';
        this.editingAssigneeId = null;
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



    // 担当者編集開始
    startEditAssignee() {
        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (!task) return;

        // 子タスクを持つタスクは編集不可
        const hasChildren = this.tasks.some(t => t.parentTaskId === this.currentTaskId);
        if (hasChildren) {
            alert('子タスクを持つタスクは編集できません。');
            return;
        }

        const assigneeSpan = document.getElementById('detailAssignee');
        const assigneeSelect = document.getElementById('editAssigneeSelect');
        const editBtn = document.getElementById('editAssigneeBtn');
        const saveBtn = document.getElementById('saveAssigneeBtn');
        const cancelBtn = document.getElementById('cancelAssigneeBtn');

        // プルダウンの選択肢を更新
        assigneeSelect.innerHTML = '<option value="">未設定</option>';
        this.assignees.forEach(assignee => {
            const option = document.createElement('option');
            option.value = assignee.name;
            option.textContent = assignee.name;
            assigneeSelect.appendChild(option);
        });

        // 現在の担当者を選択
        assigneeSelect.value = task.assignee || '';
        
        assigneeSpan.style.display = 'none';
        assigneeSelect.style.display = 'inline-block';
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
        assigneeSelect.focus();
    }

    // タスクの担当者編集保存
    saveEditTaskAssignee() {
        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (!task) return;

        const assigneeSelect = document.getElementById('editAssigneeSelect');
        const newAssignee = assigneeSelect.value;

        task.assignee = newAssignee;
        task.updatedAt = new Date().toISOString();
        
        // UI要素を更新
        const assigneeSpan = document.getElementById('detailAssignee');
        const editBtn = document.getElementById('editAssigneeBtn');
        const saveBtn = document.getElementById('saveAssigneeBtn');
        const cancelBtn = document.getElementById('cancelAssigneeBtn');

        assigneeSpan.textContent = newAssignee || '未設定';
        assigneeSpan.style.display = 'inline';
        assigneeSelect.style.display = 'none';
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';  // 5. 保存後は保存ボタンを非表示
        cancelBtn.style.display = 'none';

        this.saveTasks();
        this.renderTasks();
    }

    // タスクの担当者編集キャンセル
    cancelEditTaskAssignee() {
        const assigneeSpan = document.getElementById('detailAssignee');
        const assigneeSelect = document.getElementById('editAssigneeSelect');
        const editBtn = document.getElementById('editAssigneeBtn');
        const saveBtn = document.getElementById('saveAssigneeBtn');
        const cancelBtn = document.getElementById('cancelAssigneeBtn');

        assigneeSpan.style.display = 'inline';
        assigneeSelect.style.display = 'none';
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
    }

    // 所要時間編集開始
    startEditHours() {
        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (!task) return;

        // 子タスクを持つタスクは編集不可
        const hasChildren = this.tasks.some(t => t.parentTaskId === this.currentTaskId);
        if (hasChildren) {
            alert('子タスクを持つタスクは編集できません。');
            return;
        }

        const hoursSpan = document.getElementById('detailHours');
        const hoursInput = document.getElementById('editHoursInput');
        const editBtn = document.getElementById('editHoursBtn');
        const saveBtn = document.getElementById('saveHoursBtn');
        const cancelBtn = document.getElementById('cancelHoursBtn');

        hoursInput.value = task.estimatedHours || 0;
        hoursSpan.style.display = 'none';
        hoursInput.style.display = 'inline-block';
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
        hoursInput.focus();
    }

    // 所要時間編集保存
    saveEditHours() {
        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (!task) return;

        const hoursInput = document.getElementById('editHoursInput');
        const hours = parseFloat(hoursInput.value);

        if (!isNaN(hours) && hours >= 0) {
            task.estimatedHours = hours;
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.renderTasks();
            this.showTaskDetail(this.currentTaskId);
        } else {
            alert('有効な数値を入力してください。');
        }
    }

    // 所要時間編集キャンセル
    cancelEditHours() {
        const hoursSpan = document.getElementById('detailHours');
        const hoursInput = document.getElementById('editHoursInput');
        const editBtn = document.getElementById('editHoursBtn');
        const saveBtn = document.getElementById('saveHoursBtn');
        const cancelBtn = document.getElementById('cancelHoursBtn');

        hoursSpan.style.display = 'inline';
        hoursInput.style.display = 'none';
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
    }

    // 期限編集開始
    startEditDeadline() {
        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (!task) return;

        // 子タスクを持つタスクは編集不可
        const hasChildren = this.tasks.some(t => t.parentTaskId === this.currentTaskId);
        if (hasChildren) {
            alert('子タスクを持つタスクは編集できません。');
            return;
        }

        const deadlineSpan = document.getElementById('detailDeadline');
        const deadlineInput = document.getElementById('editDeadlineInput');
        const editBtn = document.getElementById('editDeadlineBtn');
        const saveBtn = document.getElementById('saveDeadlineBtn');
        const cancelBtn = document.getElementById('cancelDeadlineBtn');

        deadlineInput.value = task.deadline || '';
        deadlineSpan.style.display = 'none';
        deadlineInput.style.display = 'inline-block';
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
        deadlineInput.focus();
    }

    // 期限編集保存
    saveEditDeadline() {
        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (!task) return;

        const deadlineInput = document.getElementById('editDeadlineInput');
        const newDeadline = deadlineInput.value;

        if (newDeadline === '') {
            task.deadline = null;
        } else {
            const date = new Date(newDeadline);
            if (!isNaN(date.getTime())) {
                task.deadline = newDeadline;
            } else {
                alert('有効な日時を入力してください。');
                return;
            }
        }

        task.updatedAt = new Date().toISOString();
        this.saveTasks();
        this.renderTasks();
        this.showTaskDetail(this.currentTaskId);
    }

    // 期限編集キャンセル
    cancelEditDeadline() {
        const deadlineSpan = document.getElementById('detailDeadline');
        const deadlineInput = document.getElementById('editDeadlineInput');
        const editBtn = document.getElementById('editDeadlineBtn');
        const saveBtn = document.getElementById('saveDeadlineBtn');
        const cancelBtn = document.getElementById('cancelDeadlineBtn');

        deadlineSpan.style.display = 'inline';
        deadlineInput.style.display = 'none';
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
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
        if (!header) return;
        
        // 既存のユーザーセレクターを削除
        const existingSelector = header.querySelector('.user-selector');
        if (existingSelector) {
            existingSelector.remove();
        }
        
        if (this.assignees.length > 0) {
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
        if (remainingDays === '-' || remainingDays === 0) return 1;
        
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

        // 子タスクがある場合
        const childTasks = this.getChildTasks(taskId);
        if (childTasks.length > 0) {
            // すべての子タスクに期限があるかチェック
            let allChildrenHaveDeadline = true;
            let latestChildDeadline = null;

            childTasks.forEach(child => {
                const childDeadline = this.calculateLatestDeadline(child.id);
                if (childDeadline && childDeadline !== '-') {
                    if (!latestChildDeadline || new Date(childDeadline) > new Date(latestChildDeadline)) {
                        latestChildDeadline = childDeadline;
                    }
                } else {
                    // 子タスクのいずれかに期限がない場合
                    allChildrenHaveDeadline = false;
                }
            });

            // すべての子タスクに期限がない場合、親タスクの期限も無効にする
            if (!allChildrenHaveDeadline) {
                return null;
            }

            return latestChildDeadline;
        }

        // 子タスクがない場合、自分の期限を返す
        return task.deadline;
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

// グローバル変数として宣言
let taskManager;

// DOM読み込み完了後の初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM読み込み完了 ===');
    console.log('document ready:', document.readyState);
    
    // アプリケーション初期化
    console.log('スクリプト読み込み開始');
    try {
        taskManager = new TaskManager();
        window.taskManager = taskManager; // グローバルに公開
        console.log('TaskManagerインスタンス作成完了');
        console.log('window.taskManager設定:', window.taskManager);
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