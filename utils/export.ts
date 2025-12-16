
const convertToCSV = (objArray: any[], headers: string[]): string => {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = `${headers.join(',')}\r\n`;

    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (const index in headers) {
            const header = headers[index];
            if (line !== '') line += ',';
            
            let value = array[i][header] !== undefined ? array[i][header] : '';
            // Escape double quotes and wrap in double quotes if value contains comma
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            line += value;
        }
        str += `${line}\r\n`;
    }
    return str;
};

export const exportToCsv = (filename: string, rows: any[], headers: string[]): void => {
    if (!rows || !rows.length) {
        return;
    }
    const csvContent = convertToCSV(rows, headers);
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    if (link.download !== undefined) { 
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
