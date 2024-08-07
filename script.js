document.getElementById('togglePassword').addEventListener('click', function () {
  const passwordField = document.getElementById('password');
  const eyeIcon = this.querySelector('i');
  if (passwordField.type === 'password') {
    passwordField.type = 'text';
    eyeIcon.classList.remove('fa-eye');
    eyeIcon.classList.add('fa-eye-slash');
  } else {
    passwordField.type = 'password';
    eyeIcon.classList.remove('fa-eye-slash');
    eyeIcon.classList.add('fa-eye');
  }
});

document.getElementById('file-upload').addEventListener('change', function () {
  const fileInput = document.getElementById('file-upload');
  const fileInfo = document.getElementById('file-info');
  if (fileInput.files.length > 0) {
    fileInfo.textContent = `File uploaded: ${fileInput.files[0].name}`;
  } else {
    fileInfo.textContent = '';
  }
});

document.getElementById('build-btn').addEventListener('click', function () {
  const fileInput = document.getElementById('file-upload');
  const password = document.getElementById('password').value;
  const message = document.getElementById('message').value;

  if (fileInput.files.length === 0) {
    alert('Please upload a file.');
    return;
  }

  if (!password) {
    alert('Please enter a password.');
    return;
  }

  const file = fileInput.files[0];
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');

  progressContainer.classList.remove('d-none');
  progressBar.style.width = '0%';
  progressText.textContent = 'Processing...';

  const fileReader = new FileReader();
  fileReader.onload = function () {
    const filebase64 = fileReader.result.replace('data:', '').replace(/^.+,/, '');
    setTimeout(() => {
      generateHtml(filebase64, file.name, message, password);
      progressBar.style.width = '100%';
      progressText.textContent = 'Done!';
    }, 1000);
  };
  fileReader.onerror = function () {
    alert('Error reading the file.');
    progressContainer.classList.add('d-none');
  };
  fileReader.readAsDataURL(file);
});

function xor(input, password) {
  let result = '';
  for (let i = 0; i < input.length; ++i) {
    result += String.fromCharCode(password.charCodeAt(i % password.length) ^ input.charCodeAt(i));
  }
  return result;
}

function generateHtml(filebase64, filename, message, password) {
  try {
    const htmlString = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${filename}</title>
        <style>
          body { font-family: "Montserrat", sans-serif; background-color: #121212; color: #DDE6ED; }
          table { width: 100%; background: #1c1c1c; color: #DDE6ED; padding: 20px; border-radius: 8px; }
          input { background-color: #1c1c1c; color: #DDE6ED; border: 1px solid #444; }
          button { background-color: #1c1c1c; color: #DDE6ED; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
          button:hover { background-color: #444; }
        </style>
      </head>
      <body>
        <script>
          function b64toarray(base64) {
            const binString = window.atob(base64);
            const len = binString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binString.charCodeAt(i);
            }
            return bytes.buffer;
          }

          function retrieve() {
            const binary = xor(atob('${btoa(xor(filebase64, password))}'), '${password}');
            const data = b64toarray(binary);
            const blob = new Blob([data], { type: 'octet/stream' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = '${filename}';
            link.click();
            window.URL.revokeObjectURL(url);
          }

          function xor(input, password) {
            let result = '';
            for (let i = 0; i < input.length; ++i) {
              result += String.fromCharCode(password.charCodeAt(i % password.length) ^ input.charCodeAt(i));
            }
            return result;
          }
        </script>
        <table>
          <tr>
            <td>File: ${filename}</td>
          </tr>
          <tr>
            <td>Size: ${file.size.toLocaleString()} bytes</td>
          </tr>
          <tr>
            <td>Message: ${message}</td>
          </tr>
          <tr>
            <td><input type="password" id="passwordid" placeholder="Password"></td>
          </tr>
          <tr>
            <td><button onclick="retrieve()">Retrieve File</button></td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlString], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.html`;
    a.click();
    URL.revokeObjectURL(url);

    alert(`${filename} is converted and downloaded as ${filename}.html`);
  } catch (error) {
    alert('An error occurred while generating the HTML file.');
    console.error('Error generating HTML:', error);
  } finally {
    document.getElementById('progress-container').classList.add('d-none');
  }
}
