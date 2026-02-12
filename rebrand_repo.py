
import git_filter_repo as fr

def callback(commit, metadata):
    # Change author name/email
    if commit.author_name == b"Lovable" or commit.author_name == b"gpt-engineer-app[bot]":
        commit.author_name = b"Antigravity"
        commit.author_email = b"noreply@antigravity.dev"

    # Change committer name/email
    if commit.committer_name == b"Lovable" or commit.committer_name == b"gpt-engineer-app[bot]":
        commit.committer_name = b"Antigravity"
        commit.committer_email = b"noreply@antigravity.dev"

    # Message update
    try:
        msg = commit.message.decode('utf-8')
        new_msg = msg.replace("Lovable update", "Antigravity update")
        new_msg = new_msg.replace("Remove Lovable branding", "Remove old branding")
        new_msg = new_msg.replace("template: new_style_vite_react_shadcn_ts_testing_2026-01-08", "Initial project setup")
        commit.message = new_msg.encode('utf-8')
    except Exception as e:
        pass # If decoding fails, leave message as is

args = fr.FilteringOptions.parse_args(['--force'])
fr.RepoFilter(args, commit_callback=callback).run()
