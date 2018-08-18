###-begin-kawkah-{{app_name}}-completions-###
# Kawkah Completion Script
#
# Install with Redirect
#   {{app_path}} {{app_command}} {{app_script}} >> ~/.bash_profile (OS X)
#   {{app_path}} {{app_command}} {{app_script}} >> ~/.bashrc
#
_kawkah_{{app_name}}_completions()
{
    local cur args list

    cur="${COMP_WORDS[COMP_CWORD]}"
    args=("${COMP_WORDS[@]}")

    # generate completions from app.
    list=$(COMP_CWORD=$COMP_CWORD \
           COMP_LINE=$COMP_LINE \
           COMP_POINT=$COMP_POINT \
           {{app_path}} {{app_command}} {{app_reply}} "${args[@]}")

    COMPREPLY=( $(compgen -W "${list}" -- ${cur}) )

    # fall back to filename completion on no match
    if [ ${#COMPREPLY[@]} -eq 0 ]; then
      COMPREPLY=( $(compgen -f -- "${cur}" ) )
    fi

    return 0
}
complete -F _kawkah_{{app_name}}_completions {{app_name}}
###-end-kawkah-{{app_name}}-completions-###