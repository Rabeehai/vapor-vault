document.addEventListener("DOMContentLoaded", function() {
    const dropArea = document.getElementById('main-content');
	const placeholder = document.getElementById("placeholder");

    // Drag-and-drop handlers
    function onDragOver(e) {
        e.preventDefault();
        dropArea.style.backgroundColor = '#f2f2f2';
        dropArea.style.border = '3px dashed #ccc';
    }

    function onDragLeave(e) {
        e.preventDefault();
        dropArea.style.backgroundColor = '#ffffff';
        dropArea.style.border = 'none';
    }

    function onDrop(e) {
        e.preventDefault();
        dropArea.style.backgroundColor = '#ffffff';
        dropArea.style.border = 'none';
        const files = e.dataTransfer.files;
        uploadFiles(files);
    }

    function uploadFiles(files) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }

        fetch('/upload', {
            method: 'POST',
            body: formData
        }).then(response => {
            console.log('Files successfully uploaded:', response);
            updateFileList();
        }).catch(error => {
            console.error('Upload failed:', error);
        });
    }

	function addClickEventToFileItem(listItem, file) {
		listItem.addEventListener('click', function() {
			const extension = file.split('.').pop(); // Get file extension

			fetch(`/get-file/${file}`, {
				method: 'GET'
			}).then(response => response.blob()) // Get data as blob
			.then(data => {
				const contentArea = document.getElementById("file-content");
				const title_h1 = document.getElementById("title_h1");
				title_h1.textContent = file;
				
				contentArea.innerHTML = "";
				
				// Clear previous content
				contentArea.innerHTML = "";
				const text_ext = ["txt","html","md","html","htm","py","java","cpp","js","php","sql","css"]
				const image_ext = ["jpg","png","gif"]
				const sheet_ext = ["csv"]
				if (image_ext.includes(extension)) {
					// Display as image
					const img = document.createElement("img");
					img.src = URL.createObjectURL(data);
					contentArea.appendChild(img);
				} else if (text_ext.includes(extension)) {
					// Display as text
					data.text().then(text => {
						contentArea.textContent = text;
					});
				} else if (sheet_ext.includes(extension)) {
					// Display as spreadsheet
					data.text().then(text => {
						const table = csvToTable(text);
						contentArea.appendChild(table);
					});
				} else if (extension === 'pdf') {
					const iframe = document.createElement('iframe');
					iframe.src = URL.createObjectURL(data);
					iframe.width = '100%';
					iframe.height = '600px'; // or whatever dimensions you prefer
					contentArea.appendChild(iframe);
				}
				else {
					// Handle other types or display a message
					contentArea.textContent = "File type not supported for viewing.";
				}
			}).catch(error => {
				console.error('Failed to fetch file content:', error);
			});
		});
	}

	function csvToTable(csv) {
		const lines = csv.split('\n');
		const table = document.createElement('table');
		table.style.borderCollapse = 'collapse';
		table.style.width = '100%';
		table.style.border = '1px solid black';
		
		lines.forEach(line => {
			const row = document.createElement('tr');
			const cells = line.split(',');

			cells.forEach(cell => {
				const cellElement = document.createElement('td');
				cellElement.textContent = cell.trim();
				cellElement.style.border = '1px solid black';
				row.appendChild(cellElement);
			});

			table.appendChild(row);
		});

		return table;
	}

    function updateFileList() {
		fetch('/get-files', {
			method: 'GET'
		}).then(response => response.json())
		.then(data => {
			const fileList = data.files;
			const sidebar = document.querySelector("#sidebar ul");
			sidebar.innerHTML = "";

			fileList.forEach(file => {
				const listItem = document.createElement("li");
				
				const fileNameSpan = document.createElement("span");
				fileNameSpan.className = "file-name";
				fileNameSpan.textContent = file;

				const iconBoxDiv = document.createElement("div");
				iconBoxDiv.className = "icon-box";
				
				// Trash button
				createIconButton('trsh.png', 'Delete', 'trsh-button', file, deleteFile).appendTo(iconBoxDiv);
				
				// Download button
				createIconButton('dld.png', 'Download', 'dld-button', file, downloadFile).appendTo(iconBoxDiv);
				
				// Copy URL button
				createIconButton('cplnk.png', 'Copy URL', 'copy-button', file, copyURL).appendTo(iconBoxDiv);

				listItem.appendChild(fileNameSpan);
				listItem.appendChild(iconBoxDiv);
				
				// Add click event to each list item
				addClickEventToFileItem(listItem, file);
				
				sidebar.appendChild(listItem);
			});

		}).catch(error => {
			console.error('Failed to fetch file list:', error);
		});
	}

	function createIconButton(iconSrc, altText, className, fileName, clickHandler) {
		const imgElement = document.createElement("img");
		imgElement.src = `/static/images/${iconSrc}`;
		imgElement.className = className;
		imgElement.alt = altText;
		imgElement.dataset.filename = fileName;
		
		imgElement.addEventListener("click", function() {
			event.stopPropagation(); // Prevent event from bubbling up
			const fileName = this.dataset.filename;
			clickHandler(fileName);
		});
		
		return {
			appendTo: function(parentElement) {
				parentElement.appendChild(imgElement);
			}
		};
	}

	function copyURL(fileName) {
		const url = `${window.location.origin}/download/${fileName}`;
		navigator.clipboard.writeText(url).then(() => {
			alert('URL copied to clipboard');
		}).catch(err => {
			console.error('Could not copy URL:', err);
		});
	}
	
	
	function deleteFile(fileName) {
		fetch(`/delete-file/${fileName}`, {
			method: 'POST'
		}).then(response => {
			console.log('File deleted:', response);
			updateFileList();

			// Reset the file content area and title
			const contentArea = document.getElementById("file-content");
			const title_h1 = document.getElementById("title_h1");
			title_h1.textContent = "File Content";
			contentArea.innerHTML = "";
			contentArea.appendChild(placeholder);
			
		}).catch(error => {
			console.error('Delete failed:', error);
		});
	}

	
	function downloadFile(fileName) {
		const a = document.createElement("a");
		a.href = `/get-file/${fileName}`;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

    // Attach drag-and-drop listeners
    dropArea.addEventListener('dragover', onDragOver);
    dropArea.addEventListener('dragleave', onDragLeave);
    dropArea.addEventListener('drop', onDrop);

    // Populate the file list when the page initially loads
    updateFileList();
});
