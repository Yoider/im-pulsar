import zipfile
import xml.etree.ElementTree as ET
import os

def read_docx(file_path):
    try:
        with zipfile.ZipFile(file_path) as docx:
            xml_content = docx.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            # Namespaces
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            paragraphs = []
            for paragraph in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                texts = [node.text for node in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text]
                if texts:
                    paragraphs.append("".join(texts))
            return "\n".join(paragraphs)
    except Exception as e:
        return f"Error reading {file_path}: {e}"

# Test with ADRIAN's file
adrian_docx = "d:\\DEV\\AuthSndr\\ImpulsarPage\\expedientes de arraigo\\1 ADRIAN RABELLA nacionalidad española\\DATOS DE ADRIAN.docx"
if os.path.exists(adrian_docx):
    print("--- ADRIAN ---")
    print(read_docx(adrian_docx))
else:
    print("File not found")
