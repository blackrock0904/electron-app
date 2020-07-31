const {
  ipcRenderer
} = require('electron');
const path = require('path');
const btn = document.getElementById('download');
btn.disabled = true;
const filelist = document.querySelector('.Filelist');

const from = document.querySelector('#inputfolder');
const inputFrom = document.querySelector('#folderInput');

inputFrom.addEventListener('change', e => {
  filelist.innerText = "";
  let result = '';
  for (let el of inputFrom.files) {
    if (el.name.substr(-4, 4) === '.csv') {
      result += `<div>${el.name}</div>`;
    };
  }
  filelist.innerHTML += result;
  dirFrom = path.dirname(inputFrom.files[0].path);
  from.innerHTML += dirFrom;
  if (inputFrom.files.length > 0) {
    btn.disabled = false;
  }
});

btn.addEventListener('click', e => {

  ipcRenderer.send('set-folders', {
    from: path.dirname(inputFrom.files[0].path),
    to: path.dirname(inputFrom.files[0].path)
  });
});
const divI = document.querySelector('#i')
ipcRenderer.on('progress', (event, arg) => {
  document.querySelector('.determinate').style.width = `${arg.fact*100/arg.total}%`;
  divI.innerHTML = arg.total + '/' + (arg.fact + 1);
})
