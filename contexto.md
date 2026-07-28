Quiero hacer un proyecto que, en resumen, haga todo lo siguiente. quiero ser el que aporta las ideas, quiero ir afinando el proyecto. el proyecto es personal, no es para vender a nadie, yo mismo lo usaria pero quiero que quede bien, practico, lindo. necesito saber que pedir a cursor u otras ias, como modular el proyecto para poder hacerlo gratis pero por partes, no quiero planificar, diseniar una base de datos ni nada por el estilo, se bien que la ia es completamente capaz de entender que propiedades deberia tener la comida para clasificarla, por ejemplo, asi que no necesito pensar en eso. esta es la idea "Elegís un objetivo (o un preset):

* Saludable.
* Muy barato.
* Vegetariano.
* Alto en proteínas.
* Volumen (gimnasio).
* Definido por vos.

1. La app sabe qué alimentos forman ese preset.
2. Mientras armás tu compra mensual, la app te dice cosas como:
   * "Ya tenés el 82% del preset 'Alto en proteínas económico'."
   * "Te faltan avena y yogur para completarlo."
   * "Con esta compra podés cocinar 46 comidas."
3. Cada receta consume inventario.

Por ejemplo:

```

```


```
Inventario

12 L leche
60 huevos
5 kg arroz
3 kg lentejas
2 kg avena
4 kg papas
```

Preparás:

```

```


```
Desayuno:
80 g avena
300 ml leche
2 huevos
```

Entonces el stock pasa a

```

```


```
11.7 L leche
58 huevos
1.92 kg avena
```

5.  La aplicación va aprendiendo cuánto te queda realmente. 
6.  También puede decir: 

Te quedan ingredientes para 18 desayunos, 11 almuerzos y 8 cenas.
Y cuando algo empieza a faltar:
En cinco días vas a quedarte sin leche.
Eso ya me parece muy valioso.
Después viene la parte "profesional"
Que es prácticamente copiar la lógica gastronómica que usa el proyecto de tu novia.
Cada ingrediente tiene:

*  costo 
*  proveedor 
*  unidad 
*  stock 
*  rendimiento 
*  fecha de vencimiento 

Cada receta tiene:

```

```


```
120 g pollo
80 g arroz
10 ml aceite
5 g sal
```

Entonces automáticamente calcula:

*  costo de la receta 
*  proteínas 
*  calorías 
*  carbohidratos 
*  grasas 
*  fibra 
*  costo por proteína 
*  costo por caloría 
*  etc. "