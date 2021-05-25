let eventBus = new Vue();

Vue.component('producto', {
    props: {
        premium: {
            type: Boolean, 
            required: true
        }        
    },
    template: `
    <div class = "producto">
    <div class = "product-image">
        <img v-bind:src = "imagen">                    
        <a :href="link">Enlace</a>
    </div>
            
    <div class = "product-info">
        <h1>{{titulo}}</h1>
        <p v-if="enVenta">Disponible</p>
        <p class = "outStock" v-else>Agotado</p>
        <p v-show = "mostrar">Debemos mostrarte!</p>                    

        <producto-detalles :detalles = "detalles"></producto-detalles>

        <div @mouseover = "actualizarProducto(index)" v-for = "(variante, index) in variantes" :key = "variante.varianteId" class = "color-box" :style = "{backgroundColor: variante.color }" >                        
        </div>

        <div v-for = "size in sizes" :key = "size.sizeId">
            <p>{{size}}</p>
        </div>

        <h3>Costo de envío: {{envio}}</h3>

        <button v-on:click = "eS_addCarrito('add')" :disabled = "!enVenta" :class = "{disabledButton: !enVenta}">Añadir al carrito</button>
        <button v-on:click = "eS_addCarrito('quitar')">Quitar Elemento</button>



        <producto-tabs :reviews="reviews"></producto-tabs>
        
        


    </div>                
</div>  `,

data(){
    return {
        marca: 'Puro Vue',
        producto: 'Socks',
        descripcion: "Este es un calcetín verde", 
        varianteSelec: 0,
        link: "https://es-la.facebook.com/",        
        mostrar: true,        
        detalles: ["80% algodón", "20% poliester", "Cualquier género"],
        variantes: [{variante: 2234, color: "green", imagen: "./images/calcetas.jpg", cantidad: 10},{variante: 2235, color: "blue", imagen: "./images/calcetas_azul.jpg", cantidad: 0}], 
        sizes: ["Pequeño", "Mediano", "Grande"],
        reviews : [],          
        
    } 
},

methods: {
    
    actualizarProducto(index){ 
        this.varianteSelec = index
        console.log(index)
    },

    eS_addCarrito(indicacion) {
        this.$emit('add-carrito', indicacion, this.variantes[this.varianteSelec].variante)
    },


},

mounted() {
    eventBus.$on('add-review', productoReview => {
        this.reviews.push(productoReview)
    })
},

computed: {
    titulo(){
        return this.marca + ' ' + this.producto
    },

    imagen(){
        return this.variantes[this.varianteSelec].imagen
    }, 

    enVenta() {
        return this.variantes[this.varianteSelec].cantidad
    },

    envio() {
        if(this.premium) return "¡Gratis!"
        else return "$100"
    },

    recomendar(valor) {
        if(valor == "Si") true 
        else false
    }
} 

})

Vue.component('producto-detalles', {
    props: { 
        detalles: {
            typeof: Array, 
            required: true,
        }
    },

    template:     
    
    `
    <ul>
        <li v-for="detalle in detalles">{{detalle}}</li>
    </ul>
    
    `
})

Vue.component('producto-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
        <p v-if ="errores.length">

            <b>Por favor resuelve los siguientes errores: </b>
            <ul>
                <li v-for= "error in errores">{{error}}</li>
            </ul>
        </p>
        <p>
            <label for="name">Name:</label>
            <input id="name" v-model="name" placeholder="name">
        </p>
        
        <p>
            <label for="review">Review:</label>      
            <textarea id="review" v-model="review"></textarea>
        </p>
        
        <p>
            <label for="rating">Rating:</label>
            <select id="rating" v-model.number="rating">
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
            </select>
        </p>
            
        <p>
            <input type="submit" value="Submit">  
        </p> 

        <p> ¿Recomendaría este producto? </p> 
        <div>
            <input type ="checkbox" id = "si" v-model="recomendar" >                        
        </div>
        
    </form>
    `,
    data() {
        return {
            name: null,
            rating: null, 
            review: null, 
            errores: [],
            recomendar: null,            
        }
    }, 
    methods: {        
        onSubmit() {
            

            if(!this.name && !this.errores.includes("No se colocó un nombre")) this.errores.push("No se colocó un nombre");
            else if (this.name) this.errores = this.errores.filter((error) => error !== "No se colocó un nombre");
                
            if(!this.rating && !this.errores.includes("No se colocó una calificación")) this.errores.push("No se colocó una calificación");
            else if (this.rating) this.errores = this.errores.filter((error) => error !== "No se colocó una calificación");
                
            if(!this.review &&  !this.errores.includes("No se colocó una reseña")) this.errores.push("No se colocó una reseña");
            else if(this.review) this.errores = this.errores.filter((error) => error !== "No se colocó una reseña");

            if(this.name && this.rating && this.review){
                let reviewProducto = {
                    nombre : this.name, 
                    calificacion : this.rating,
                    review : this.review,
                    recomienda: this.recomendar
                }
    
                eventBus.$emit('add-review', reviewProducto);
    
                this.name = null;
                this.rating = null;
                this.review = null;
                this.recomendar = null;
            }                        
        }
    }, 
}
)


Vue.component('producto-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false,
            
        }
    },
    template: `
        <div>
            <span class = "tab" :class = "{activeTab: selectTab === tab}" v-for = "(tab, index) in tabs" :key = "index" @click = "selectTab = tab">{{tab}}</span>
            <div v-show = "selectTab === '¡Realiza una reseña!'">
                <producto-review></producto-review>
            </div>
            <div v-show = "selectTab === 'Reseñas'">                
                <li v-for = "review in reviews">
                    <p>{{review.nombre}}</p>
                    <p>Calificación: {{review.calificacion}}</p>
                    <p>Reseña: {{review.review}}</p>
                </li>
            </div>                        
        </div>

        
    `,
    
    data() {
        return {
            tabs: ["Reseñas", "¡Realiza una reseña!"],
            selectTab: 'Reseñas',            
        }
    }
})

var app = new Vue({
    el: '#app',
    data: {
        premium: true,
        carrito: []
    },
    methods: {
        modCarrito(decision, id) {
            console.log(decision);            
            if(decision == "add")  this.carrito.push(id);
            else {
                primero = false;
                indice = this.carrito.indexOf(id);
                let filtrado = this.carrito.filter((e) => {
                    if(!primero && e !== id) {                        
                        return true;
                    } else if(!primero && e == id) {
                        primero = true;
                        return false ;
                    } else if (primero) {
                        return true
                    }
                }
            )            
                this.carrito = filtrado
            }
        }, 
    }
    
})
