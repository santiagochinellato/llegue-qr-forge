export function downloadSvg(svgElement: SVGSVGElement, filename: string) {
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svgElement);
  
  // Add namespaces
  if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      // should be handled by the element itself usually, but good for safety
  }
  
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename + '.svg');
}

export function downloadPng(svgElement: SVGSVGElement, filename: string) {
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Get actual size
    const width = parseInt(svgElement.getAttribute('width') || '500');
    const height = parseInt(svgElement.getAttribute('height') || '500');

    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
        if (ctx) {
            ctx.drawImage(img, 0, 0);
            const pngUrl = canvas.toDataURL('image/png');
            triggerDownload(pngUrl, filename + '.png');
            URL.revokeObjectURL(url);
        }
    };
    img.src = url;
}


function triggerDownload(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
