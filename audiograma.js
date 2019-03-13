angular.module('audiograma', [])
.directive('audiograma', [function () {
    return {
        scope: { data: '=audiograma', width: '@', height: '@', readonly : '@' },
        template: '<div class="controles-audiograma"><label>Oido Izquierdo</label><input type="text" ng-disabled="readonly" class="form-control input-sm" placeholder="{{frecuency}}Hz" ng-repeat="frecuency in data.Frecuencia" ng-model="data.Aerea.Derecho[$index]"/></div>' +
                  '<div class="controles-audiograma"><label>Oido Derecho</label><input type="text" ng-disabled="readonly" class="form-control input-sm" placeholder="{{frecuency}}Hz" ng-repeat="frecuency in data.Frecuencia" ng-model="data.Aerea.Izquierdo[$index]"/></div>',
        link: function (scope, element, attrs) {
            var divGraph = angular.element('<div></div>');
            element.append(divGraph);
            var width = scope.width,
                height = scope.height,
                margin = { top: 50, right: 10, bottom: 10, left: 40 },
                data = scope.data,
                paper = Raphael(divGraph[0], width, height),
                tl = { x: margin.left, y: margin.top },
                tr = { x: width - margin.right, y: tl.y },
                br = { x: width - margin.right, y: height - margin.bottom },
                bl = { x: tl.x, y: br.y },
                availableWidth = width - margin.left - margin.right,
                availableHeigth = height - margin.top - margin.bottom,
                dx = availableWidth / (data.Frecuencia.length + 1),
                dy = availableHeigth / (data.Volumen.length + 1),
                minVolume = data.Volumen[0],
                maxVolume = data.Volumen[data.Volumen.length - 1],
                totalRange = maxVolume + (minVolume < 0 ? Math.abs(minVolume) : -minVolume),
                step = totalRange / (data.Volumen.length - 1),
                gridLineAttr = { stroke: '#000', opacity: .5 },
                leftSymbol="X",
                rightSymbol="O",
                attrAISymbol = { 'stroke': '#00F' },
                attrADSymbol = { 'stroke': '#F00' };

            function drawStaticElements() {
                //Draw the grid border
                paper.rect(tl.x, tl.y, availableWidth, availableHeigth).attr(gridLineAttr);
                //Vertical frequence lines
                for (var f = 0; f < data.Frecuencia.length; f++) {
                    var x = (tl.x + (dx * (f + 1)));
                    paper.path('M' + x + ' ' + tl.y + 'L' + x + ' ' + bl.y).attr(gridLineAttr);
                    paper.text(x, tl.y, data.Frecuencia[f]).transform("r270t20,0");
                }
                //Horizontal frequence lines
                for (var v = 0; v < data.Volumen.length; v++) {
                    var y = (tl.y + (dy * (v + 1)));
                    paper.path('M' + tl.x + ' ' + y + 'L' + tr.x + ' ' + y).attr(gridLineAttr);
                    paper.text(tl.x - 5, y, data.Volumen[v]).attr('text-anchor', 'end');
                }
            }
            function drawPoints(coordinates, symbol, attr) {
                var elements = [];
                if (coordinates.length > 0) {
                    for (var c = 0; c < coordinates.length; c++) {
                        var coordinate = coordinates[c];
                        if (coordinate != null) {
                            var element = paper.text(coordinate.x, coordinate.y, symbol).attr(attr);
                            elements.push(element);
                        } else {
                            elements.push(null);
                        }
                    }
                }
                return elements;
            }
            function calculatePointsCoordinates(values) {
                var coordinates = [];
                for (var p = 0; p < values.length; p++) {
                    var value = values[p];
                    if (String(value).trim().length == 0) {
                        value = NaN;
                    }
                    var number = Number(value);
                    if (value != null && !isNaN(number) && value >= minVolume && value <= maxVolume) {
                        var difference = Math.abs(minVolume - value) / step;
                        coordinates.push({
                            x: tl.x + dx * (p + 1),
                            y: tl.y + dy * (difference + 1)
                        });
                    } else {
                        coordinates.push(null);
                    }
                }
                return coordinates;
            }
            function getLinePath(coordinates) {
                if (coordinates.length > 1) {
                    var linePoints = [];
                    var previousElement = null;
                    for (var i = 0; i < coordinates.length; i++) {
                        var coordinate = coordinates[i];
                        if (coordinate != null) {
                            linePoints.push({ x: coordinate.x, y: coordinate.y });
                        }
                    }
                    if (linePoints.length > 1) {
                        return joinPoints(linePoints);
                    }
                }
                return "M0,0L0,0";
            }
            function joinPoints(points) {
                var i = 0, str = new Array();
                var firstPoint = points[0];
                str[i++] = 'M' + firstPoint.x + ',' + firstPoint.y;
                for (var p = 1; p < points.length; p++) {
                    var point = points[p];
                    str[i++] = 'L';
                    str[i++] = point.x;
                    str[i++] = ',';
                    str[i++] = point.y;
                }
                return str.join('');
            }
            function drawLines(coordinates, lineAttr) {
                var linePath = getLinePath(coordinates);
                if (linePath != null) {
                    return paper.path(linePath).attr(lineAttr);
                }
                return null;
            }
            setTimeout(function () {
                drawStaticElements();
                scope.leftCoordinates = calculatePointsCoordinates(data.Aerea.Izquierdo);
                scope.rightCoordinates = calculatePointsCoordinates(data.Aerea.Derecho);
                scope.leftPoints = drawPoints(scope.leftCoordinates, leftSymbol, attrAISymbol);
                scope.rightPoints = drawPoints(scope.rightCoordinates, rightSymbol, attrADSymbol);
                scope.leftLine = drawLines(scope.leftCoordinates, attrAISymbol);
                scope.rightLine = drawLines(scope.rightCoordinates, attrADSymbol);
            }, 1);
            scope.$watchCollection('data.Aerea.Izquierdo', function (newValue, oldValue) {
                if (newValue != oldValue) {
                    for (var i = 0; i < newValue.length; i++) {
                        if (newValue[i] != oldValue[i]) {
                            scope.changeDetected(i, true);
                            break;
                        }
                    }
                }
            });
            scope.$watchCollection('data.Aerea.Derecho', function (newValue, oldValue) {
                if (newValue != oldValue) {
                    for (var i = 0; i < newValue.length; i++) {
                        if (newValue[i] != oldValue[i]) {
                            scope.changeDetected(i, false);
                            break;
                        }
                    }
                }
            });
            scope.changeDetected = function (index, left) {
                var points,coordinates, line, symbol, attrSymbol;
                if (left) {
                    scope.leftCoordinates = calculatePointsCoordinates(data.Aerea.Izquierdo);
                    points = scope.leftPoints;
                    coordinates = scope.leftCoordinates;
                    line = scope.leftLine;
                    symbol = leftSymbol;
                    attrSymbol = attrAISymbol;
                } else {
                    scope.rightCoordinates = calculatePointsCoordinates(data.Aerea.Derecho);
                    points = scope.rightPoints;
                    coordinates = scope.rightCoordinates;
                    line = scope.rightLine;
                    symbol = rightSymbol;
                    attrSymbol = attrADSymbol;
                }
                var point = points[index];
                var coordinate = coordinates[index];
                if (coordinate != null) {
                    if (point == null) {
                        var element = paper.text(coordinate.x, coordinate.y, symbol).attr(attrSymbol);
                        points[index] = element;
                    } else {
                        point.animate({ y: coordinate.y }, 200, 'bounce');
                    }
                } else {//Point is not valid
                    if (point != null) {
                        point.remove();
                        points[index] = null;
                    }
                }
                var newPath = getLinePath(coordinates);
                line.animate({ path: newPath }, 200, 'bounce');
            };
        }
    };
}])


