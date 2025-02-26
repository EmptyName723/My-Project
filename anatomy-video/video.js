document.addEventListener("DOMContentLoaded", function () {
  const sheetIDs = {
    "甲一": "0",
    "甲二": "1494659658",
    "甲三": "237099196",
    "甲四": "463563180",
    "甲五": "1372435512",
    "甲六": "986035467",
    "甲七": "65697428",
    "乙一": "87958853",
    "乙二": "482936662",
    "乙三": "974873327",
    "乙四": "1374061122",
    "乙五": "187902868",
    "乙六": "286015303",
    "乙七": "321724438",
  };

  let nameData = {}; // Store data by sheet name

  function parseCSV(csvText) {
    const rows = [];
    let row = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"' && nextChar === '"') {
        current += '"'; // Handle escaped double quotes
        i++;
      } else if (char === '"') {
        insideQuotes = !insideQuotes; // Toggle quote status
      } else if (char === ',' && !insideQuotes) {
        row.push(current.trim());
        current = "";
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (current || row.length > 0) row.push(current.trim());
        if (row.length > 0) rows.push(row);
        row = [];
        current = "";
      } else {
        current += char;
      }
    }

    if (current || row.length > 0) row.push(current.trim());
    if (row.length > 0) rows.push(row);
    return rows;
  }

  function fetchData(sheetName, gid) {
    return new Promise((resolve, reject) => {
      const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRZZvl0sPVZwAKhE0U2kUtEuxNKQPMBSRmVQlhLcIBYFzV8uWYST04tj4cj3ze-1YqZQotYIvF0lvlT/pub?gid=${gid}&single=true&output=csv`;

      console.log(`Fetching data from: ${url}`);

      fetch(url)
        .then(response => {
          if (!response.ok) {
            return reject(`Failed to fetch data for ${sheetName} (HTTP ${response.status})`);
          }
          return response.text();
        })
        .then(name_csv => {
          console.log(`Raw CSV for ${sheetName}:`, name_csv.substring(0, 100));

          if (!name_csv.trim()) {
            reject(`Empty response for ${sheetName}`);
            return;
          }

          const parsedCSV = parseCSV(name_csv);
          const headers = parsedCSV[0];
          const name_list = [];

          let currentTeacher = null;

          for (let i = 1; i < parsedCSV.length; i++) {
            const data = parsedCSV[i];
            const rowObject = {};

            headers.forEach((header, j) => {
              rowObject[header] = data[j] || "";
            });

            if (rowObject["授課老師"] && rowObject["授課老師"].trim() !== "") {
              currentTeacher = rowObject["授課老師"].trim();
            }

            rowObject["Assigned Teacher"] = currentTeacher;
            name_list.push(rowObject);
          }

          resolve({ sheetName, data: name_list });
        })
        .catch(error => reject(error));
    });
  }

  Promise.all(
    Object.entries(sheetIDs).map(([sheetName, gid]) => fetchData(sheetName, gid))
  )
    .then(results => {
      nameData = results.reduce((acc, { sheetName, data }) => {
        acc[sheetName] = data;
        return acc;
      }, {});
      console.log("Final processed dataset:", nameData);
    })
    .catch(error => {
      console.error("Fetching error:", error);
    });

  const selectElement = document.getElementById("select");
  const testElement = document.getElementById("test");

  if (selectElement && testElement) {
    selectElement.onchange = function () {
      const selectedTeacher = selectElement.value;
      let outputHTML = "";

      Object.entries(nameData).forEach(([sheetName, rows]) => {
        // Filter out rows where "串流連結" is "N/A"
        const matchingRows = rows.filter(row => 
          row["Assigned Teacher"] === selectedTeacher && row["串流連結"] && row["串流連結"] !== "N/A"
        );

        if (matchingRows.length > 0) {
          outputHTML += `<h3>${sheetName}</h3><ul>`;

          let lastRowHadDate = true; // Track if the last row had a date

          matchingRows.forEach(row => {
            const classDate = row["課堂日期、第幾節"]?.trim() || "";
            const keyPoints = row["考點、重點（沒有請填沒有）"]?.trim() || "未填考點";
            let streamLink = row["串流連結"] || "";

            // Convert multiple URLs into clickable links
            streamLink = streamLink.replace(/https:\/\/[^\s,]+/g, (match) => {
              return ` <a href="${match}" target="_blank">串流連結</a>`;
            });

            outputHTML += `
                ${classDate ? `<li><strong>授課日期：</strong> ${classDate}<br>` : ""}
                <ul>
                  <li>${keyPoints} &nbsp&nbsp <u>${streamLink}</u></li>
                </ul>
              </li>
            `;

            lastRowHadDate = !!classDate; // Update flag
          });

          outputHTML += `</ul>`;
        }
      });

      testElement.innerHTML = outputHTML || "選太快了！再選一次看看（或還沒上課）";
    };
  } else {
    console.error("Select or test element not found in DOM.");
  }
});

var darkMode = 0;

function toggleDark() {
  var element = document.body;
  
  element.classList.toggle("dark-mode");

  darkMode = !darkMode;

  document.getElementById("darkButton").innerHTML = `${darkMode ? `亮色模式` : "暗色模式"}`;
}
