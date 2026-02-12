#!/bin/sh

if [ "$GIT_AUTHOR_NAME" = "Lovable" ] || [ "$GIT_AUTHOR_NAME" = "gpt-engineer-app[bot]" ]; then
    export GIT_AUTHOR_NAME="Antigravity"
    export GIT_AUTHOR_EMAIL="noreply@antigravity.dev"
fi
if [ "$GIT_COMMITTER_NAME" = "Lovable" ] || [ "$GIT_COMMITTER_NAME" = "gpt-engineer-app[bot]" ]; then
    export GIT_COMMITTER_NAME="Antigravity"
    export GIT_COMMITTER_EMAIL="noreply@antigravity.dev"
fi
