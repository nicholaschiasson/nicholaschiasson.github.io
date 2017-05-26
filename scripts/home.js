// jshint esversion: 6

let commandIndex = 0;
let contextMenu;
let history = [];
let minCursorPosition = 0;
let promptString = "$ ";
let shell;

let ShellCommands = {
  echo: {
    synopsis: [
      "NAME",
      "\techo - display a line of text",
      "",
      "SYNOPSIS",
      "\techo [STRING]...",
      ""
    ],
    callback: function (args) {
      if (shell) {
        if (args.length < 1) {
          shell.value += "\n";
        } else {
          for (let i = 0; i < args.length; i++) {
            shell.value += args[i] + "\n";
          }
        }
      }
    }
  },
  help: {
    synopsis: [
      "NAME",
      "\thelp - display synopsis for a command",
      "",
      "SYNOPSIS",
      "\techo [COMMAND]",
      ""
    ],
    callback: function (args) {
      if (shell) {
        if (args.length > 0) {
          for (let i = 0; i < args.length; i++) {
            if (ShellCommands[args[i]]) {
              ShellCommands.echo.callback(ShellCommands[args[i]].synopsis);
            }
          }
        } else {
          let keys = Object.keys(ShellCommands);
          for (let i = 0; i < keys.length; i++) {
            ShellCommands.echo.callback(ShellCommands[keys[i]].synopsis);
          }
        }
      }
    }
  }
};

function prompt() {
  if (shell) {
    shell.value += promptString;
    minCursorPosition = shell.selectionStart;
  }
}

function initializeHome() {
  contextMenu = document.getElementById("context-menu");
  shell = document.getElementById("console");
  if (shell) {
    ShellCommands.echo.callback(["Welcome to Nicholas Omer Chiasson's home page!",
                                "This is the interactive Nick-Shell.",
                                "I didn't have any idea what to actually put on this home page and I'm not exactly the most artistic developer, so here's a little something to fill the page that I thought would be fun to implement.",
                                "I made this because I'm a fan of using the terminal. In particular I am an avid user of the Bash shell, but if you're not familiar with using any terminal then I suggest visiting any of the other pages on this site. After all, that's where all of the real content lies.",
                                "Otherwise, feel free to have some fun with this little toy I made using javascript and a textarea tag.",
                                "Type 'help' at any time to view a synopsis for all valid commands.",
                                ""]);
    prompt();
    shell.focus();
    shell.addEventListener("keydown", shellOnInput);
    shell.addEventListener("cut", shellOnClipboard);
    shell.addEventListener("paste", shellOnClipboard);
  }
}
function shellOnInput(e) {
  if (shell) {
    if (!e.key.startsWith("Arrow") && ((shell.selectionStart < minCursorPosition) ||
        (shell.selectionStart <= minCursorPosition && e.key === "Backspace"))) {
      e.preventDefault();
    } else if (shell.selectionStart >= minCursorPosition) {
      if (e.key === "Enter") {
        e.preventDefault();
        let commandString = shell.value.substring(minCursorPosition);
        let commandArguments = commandString.match(/\S+/g) || [];
        shell.value += "\n";
        if (commandArguments.length > 0) {
          let command = commandArguments.shift();
          history[history.length - 1] = commandString;
          commandIndex = history.length;
          history.push("");
          if (ShellCommands[command]) {
            ShellCommands[command].callback(commandArguments);
          } else {
            ShellCommands.echo.callback([command + ": command not found"]);
          }
        }
        prompt();
        shell.scrollTop = shell.scrollHeight;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (commandIndex > 0) {
          commandIndex--;
          shell.value = shell.value.substring(0, minCursorPosition) + history[commandIndex];
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (commandIndex < history.length - 1) {
          commandIndex++;
          shell.value = shell.value.substring(0, minCursorPosition) + history[commandIndex];
        }
      } else {
        if (history.length < 1) {
          history.push("");
        }
        if (commandIndex === history.length - 1) {
          history[history.length - 1] = shell.value.substring(minCursorPosition) + e.key;
        }
      }
    }
  }
}

function shellOnClipboard(e) {
  if (shell.selectionStart < minCursorPosition) {
    e.preventDefault();
  }
}

window.addEventListener("initialized", initializeHome, true);
