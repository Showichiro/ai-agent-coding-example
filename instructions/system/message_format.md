# Message Format for tmux-Based Agent Communication

## Format: Task Dispatch (from Task Manager)

```bash
tmux send-keys -t %22 "
cd 'working_dir' &&
echo '[coder] Task: Implement login endpoint' &&
echo 'Description: ...' &&
echo 'Refer to: docs/api/endpoints.md' &&
echo 'Output file: src/app/api/login/route.ts' &&
echo 'If error: tmux send-keys -t %21 \"[coder -> task-manager] Error: description\" && Enter' &&
echo 'Start coding.'
" && sleep 0.1 && tmux send-keys -t %22 Enter
```

## Format: Result Reporting (from agent to Task Manager)

```bash
tmux send-keys -t %21 "
echo '[coder -> task-manager] Task completed: login endpoint implemented.' &&
echo 'File: src/app/api/login/route.ts' &&
echo 'Please validate.'
" && sleep 0.1 && tmux send-keys -t %21 Enter
```

## Format: Error Reporting

```bash
tmux send-keys -t %21 "
echo '[coder -> task-manager] Error: Missing user model definition.' &&
echo 'Please clarify or assign a task to designer.'
" && sleep 0.1 && tmux send-keys -t %21 Enter
```