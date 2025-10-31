// Модуль сохранения данных
const saveModule = {
    
    // Сохранить проект в HTML файл
    saveProject: function() {
        // Собираем все данные проекта
        const projectData = {
            points: this.getPointsData(),
            lines: this.getLinesData(),
            metadata: {
                savedAt: new Date().toISOString(),
                version: '1.0'
            }
        };
        
        // Создаем HTML файл для просмотра
        const htmlContent = this.generateHTML(projectData);
        
        // Создаем и скачиваем файл
        this.downloadHTML(htmlContent, 'схема_видеонаблюдения.html');
        
        ui.updateStatus("Проект сохранен в HTML файл");
    },
    
    // Получить данные точек
    getPointsData: function() {
        return points.points.map(point => ({
            coords: point.coords,
            type: point.type,
            name: point.name,
            directions: point.directions ? point.directions.map(dir => ({
                angle: dir.angle
            })) : []
        }));
    },
    
    // Получить данные линий
    getLinesData: function() {
        return lines.lines.map(line => ({
            points: line.points,
            type: line.type,
            distance: line.distance
        }));
    },
    
    // Рассчитать центр карты по меткам
    calculateMapCenter: function(points) {
        if (points.length === 0) {
            return [55.76, 37.64]; // Центр по умолчанию
        }
        
        let minLat = points[0].coords[0];
        let maxLat = points[0].coords[0];
        let minLon = points[0].coords[1];
        let maxLon = points[0].coords[1];
        
        points.forEach(point => {
            const [lat, lon] = point.coords;
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLon = Math.min(minLon, lon);
            maxLon = Math.max(maxLon, lon);
        });
        
        // Центр области с метками
        const centerLat = (minLat + maxLat) / 2;
        const centerLon = (minLon + maxLon) / 2;
        
        return [centerLat, centerLon];
    },
    
    // Генерация HTML для просмотра
    generateHTML: function(projectData) {
        const mapCenter = this.calculateMapCenter(projectData.points);
        
        return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Схема видеонаблюдения - Просмотр</title>
    <script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=bd850cad-cfa8-44ac-a2a9-5063ade5154c"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 10px; }
        .header { background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .map-container { background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 10px; }
        #map { width: 100%; height: 500px; border-radius: 4px; }
        .info-panel { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .section { margin-bottom: 15px; }
        .section-title { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #333; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .stat-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
        .stat-item:last-child { border-bottom: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Схема видеонаблюдения</h1>
            <p>Сохранено: ${new Date(projectData.metadata.savedAt).toLocaleString('ru-RU')}</p>
        </div>
        
        <div class="map-container">
            <div id="map"></div>
        </div>
        
        <div class="info-panel">
            <div class="section">
                <div class="section-title">Статистика проекта</div>
                <div class="stats-grid" id="stats"></div>
            </div>
        </div>
    </div>

    <script>
        // Данные проекта
        const projectData = ${JSON.stringify(projectData, null, 4)};
        const mapCenter = ${JSON.stringify(mapCenter)};
        
        // Типы оборудования
        const typeNames = {
            camera: 'Камера',
            box: 'POE коробка',
            optical: 'Опт. коробка',
            pole: 'Столб',
            pole_with_camera: 'POE коробка с камерой'
        };
        
        // Инициализация карты
        ymaps.ready(function() {
            // Создаем карту с центром по меткам
            const map = new ymaps.Map("map", {
                center: mapCenter,
                zoom: 15
            });
            
            // Добавляем точки
            projectData.points.forEach(point => {
                // Создаем кастомную иконку
                const placemark = new ymaps.Placemark(point.coords, {
                    balloonContent: \`
                        <div style="padding: 10px;">
                            <strong>\${point.name}</strong><br>
                            \${typeNames[point.type]}<br>
                            \${point.directions && point.directions.length > 0 ? 'Камеры: ' + point.directions.length + ' шт.' : ''}
                        </div>
                    \`,
                    hintContent: point.name
                }, {
                    // Используем стандартный layout с кастомной иконкой
                    iconLayout: 'default#image',
                    iconImageHref: getIconForType(point.type),
                    iconImageSize: [32, 32],
                    iconImageOffset: [-16, -16],
                    hideIconOnBalloonOpen: false
                });
                
                map.geoObjects.add(placemark);
                
                // Добавляем текстовую метку
                const textLabel = new ymaps.Placemark(point.coords, {
                    iconContent: point.name
                }, {
                    iconLayout: 'default#imageWithContent',
                    iconImageHref: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
                    iconImageSize: [1, 1],
                    iconImageOffset: [0, -45],
                    iconContentLayout: ymaps.templateLayoutFactory.createClass(
                        \`<div style="background: \${getBackgroundColor(point.type)}; border: 2px solid \${getBorderColor(point.type)}; border-radius: 15px; color: white; font-size: 11px; font-family: Arial, sans-serif; font-weight: bold; text-align: center; padding: 4px 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); text-shadow: 1px 1px 2px rgba(0,0,0,0.5); line-height: 1.2; white-space: nowrap; display: inline-block; opacity: 0.9;">{{ properties.iconContent }}</div>\`
                    ),
                    zIndex: 999
                });
                
                map.geoObjects.add(textLabel);
                
                // Добавляем направления для камер
                if (point.directions && point.directions.length > 0 && (point.type === 'camera' || point.type === 'pole_with_camera')) {
                    point.directions.forEach(direction => {
                        const sectorCoords = calculateDirectionSector(point.coords, direction.angle, 70);
                        const sector = new ymaps.Polygon([sectorCoords], {}, {
                            fillColor: 'rgba(74, 144, 226, 0.3)',
                            strokeColor: 'rgba(74, 144, 226, 0.8)',
                            strokeWidth: 2,
                            zIndex: 1
                        });
                        map.geoObjects.add(sector);
                    });
                }
            });
            
            // Добавляем линии
            projectData.lines.forEach(line => {
                const polyline = new ymaps.Polyline(line.points, {}, {
                    strokeColor: line.type === 'optical_line' ? '#FF0000' : '#000000',
                    strokeWidth: 5,
                    strokeOpacity: 0.9
                });
                map.geoObjects.add(polyline);
                
                // Добавляем метку расстояния
                const middlePoint = getMiddlePointOnLine(line.points);
                const distanceLabel = new ymaps.Placemark(middlePoint, {
                    iconContent: line.distance.toFixed(1) + ' м'
                }, {
                    iconLayout: 'default#imageWithContent',
                    iconImageHref: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="90" height="34"><rect width="90" height="34" fill="transparent"/></svg>',
                    iconImageSize: [90, 34],
                    iconImageOffset: [-45, -17],
                    iconContentLayout: ymaps.templateLayoutFactory.createClass(
                        \`<div style="background: \${line.type === 'optical_line' ? '#FF4444' : '#333333'}; border: 2px solid \${line.type === 'optical_line' ? '#CC0000' : '#000000'}; border-radius: 15px; color: white; font-size: 12px; font-family: Arial, sans-serif; font-weight: bold; text-align: center; padding: 6px 12px; min-width: 70px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); text-shadow: 1px 1px 2px rgba(0,0,0,0.5); line-height: 1.2; white-space: nowrap;">{{ properties.iconContent }}</div>\`
                    )
                });
                map.geoObjects.add(distanceLabel);
            });
            
            // Обновляем статистику
            updateStats();
        });
        
        // Функция для получения иконки по типу
        function getIconForType(type) {
            // Используем base64 кодировку для SVG
            const icons = {
                camera: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgZmlsbD0iIzRBOTBFMiIgc3Ryb2tlPSIjMkM2RkI3IiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI2IiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+',
                box: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB4PSI2IiB5PSI2IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHJ4PSIzIiBmaWxsPSIjMzMzMzMzIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0xNiAxMCBMMTYgMjIgTTEwIDE2IEwyMiAxNiIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==',
                optical: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cGF0aCBkPSJNMTYgNiBMMjQgMTIgTDI0IDIwIEwxNiAyNiBMOCAyMCBMOCAxMiBaIiBmaWxsPSIjRkY0NDQ0IiBzdHJva2U9IiNDQzAwMDAiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjMiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=',
                pole: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB4PSIxMiIgeT0iNiIgd2lkdGg9IjgiIGhlaWdodD0iMjAiIGZpbGw9IiMzMzMzMzMiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iOSIgeT0iMyIgd2lkdGg9IjE0IiBoZWlnaHQ9IjMiIGZpbGw9IiM2NjY2NjYiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+',
                pole_with_camera: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB4PSIxMiIgeT0iNiIgd2lkdGg9IjgiIGhlaWdodD0iMjAiIGZpbGw9IiM0QTkwRTIiIHN0cm9rZT0iIzJDNkZCNyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iOSIgeT0iMyIgd2lkdGg9IjE0IiBoZWlnaHQ9IjMiIGZpbGw9IiM2QkE4RTgiIHN0cm9rZT0iIzJDNkZCNyIgc3Ryb2tlLXdpZHRoPSIxIi8+PGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNSIgZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjMkM2RkI3IiBzdHJva2Utd2lkdGg9IjEiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjEyIiByPSIyIiBmaWxsPSIjMkM2RkI3Ii8+PC9zdmc+'
            };
            return icons[type] || icons.camera;
        }
        
        // Функции для цветов
        function getBackgroundColor(type) {
            const colors = {
                'camera': 'rgba(51, 51, 51, 0.9)',
                'box': 'rgba(51, 51, 51, 0.9)',
                'optical': 'rgba(255, 68, 68, 0.9)',
                'pole': 'rgba(51, 51, 51, 0.9)',
                'pole_with_camera': 'rgba(74, 144, 226, 0.9)'
            };
            return colors[type] || 'rgba(51, 51, 51, 0.9)';
        }
        
        function getBorderColor(type) {
            const colors = {
                'camera': '#000000',
                'box': '#000000',
                'optical': '#CC0000',
                'pole': '#000000',
                'pole_with_camera': '#2C6FB7'
            };
            return colors[type] || '#000000';
        }
        
        // Функции для расчетов
        function calculateDirectionSector(centerCoords, angle, sectorWidth) {
            const centerLat = centerCoords[0];
            const centerLon = centerCoords[1];
            const radius = 0.0007;
            
            const startAngle = angle - sectorWidth / 2;
            const endAngle = angle + sectorWidth / 2;
            
            const coords = [[centerLat, centerLon]];
            
            const steps = 20;
            for (let i = 0; i <= steps; i++) {
                const currentAngle = startAngle + (endAngle - startAngle) * (i / steps);
                const rad = currentAngle * Math.PI / 180;
                
                const lat = centerLat + radius * Math.cos(rad);
                const lon = centerLon + radius * Math.sin(rad);
                
                coords.push([lat, lon]);
            }
            
            coords.push([centerLat, centerLon]);
            
            return coords;
        }
        
        function getMiddlePointOnLine(points) {
            if (points.length < 2) return points[0] || [0, 0];
            
            let totalDistance = 0;
            for (let i = 0; i < points.length - 1; i++) {
                totalDistance += ymaps.coordSystem.geo.getDistance(points[i], points[i+1]);
            }
            
            const targetDistance = totalDistance / 2;
            let accumulatedDistance = 0;
            
            for (let i = 0; i < points.length - 1; i++) {
                const segmentDistance = ymaps.coordSystem.geo.getDistance(points[i], points[i+1]);
                
                if (accumulatedDistance + segmentDistance >= targetDistance) {
                    const ratio = (targetDistance - accumulatedDistance) / segmentDistance;
                    const lat = points[i][0] + (points[i+1][0] - points[i][0]) * ratio;
                    const lon = points[i][1] + (points[i+1][1] - points[i][1]) * ratio;
                    return [lat, lon];
                }
                
                accumulatedDistance += segmentDistance;
            }
            
            return points[points.length - 1];
        }
        
        function updateStats() {
            // Подсчет оборудования для сохраненного файла
            let totalPoeBoxes = 0;
            let totalCameras = 0;
            
            projectData.points.forEach(point => {
                if (point.type === 'box') {
                    totalPoeBoxes += 1;
                } else if (point.type === 'pole_with_camera') {
                    totalPoeBoxes += 1;
                    totalCameras += point.directions ? point.directions.length : 0;
                } else if (point.type === 'camera') {
                    totalCameras += point.directions ? point.directions.length : 0;
                }
            });
            
            const ethernetLines = projectData.lines.filter(line => line.type === 'ethernet_line');
            const opticalLines = projectData.lines.filter(line => line.type === 'optical_line');
            
            const totalEthernetLength = ethernetLines.reduce((sum, line) => sum + line.distance, 0);
            const totalOpticalLength = opticalLines.reduce((sum, line) => sum + line.distance, 0);
            
            document.getElementById('stats').innerHTML = \`
                <div class="stat-item">
                    <span>POE коробок:</span>
                    <span>\${totalPoeBoxes}</span>
                </div>
                <div class="stat-item">
                    <span>Камер:</span>
                    <span>\${totalCameras}</span>
                </div>
                <div class="stat-item">
                    <span>Витая пара:</span>
                    <span>\${totalEthernetLength.toFixed(1)} м</span>
                </div>
                <div class="stat-item">
                    <span>Оптический кабель:</span>
                    <span>\${totalOpticalLength.toFixed(1)} м</span>
                </div>
            \`;
        }
    </script>
</body>
</html>`;
    },
    
    // Скачать HTML файл
    downloadHTML: function(content, filename) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};