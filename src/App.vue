<script setup>
  import db from './firebase/config';
  import { ref, onMounted, computed  } from 'vue';
  import {collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc} from 'firebase/firestore'


  const isEdit = ref(false)
  const editId = ref(null);

  const products = ref([])
  const itemData = ref('')
  const typeData = ref('')
  const amountDAta = ref('')

  const showEmptyFieldsMessage = ref(false);

  const getProduct = async () => {
        onSnapshot(collection(db, 'Product'), data => {
            const tmp = []
            data.forEach(doc => {
                const product = {
                  id: doc.id,
                  data: {
                    ...doc.data(),
                    dateAdded: doc.data().dateAdded.toDate()
                }
                }    
                tmp.push(product)
            })
            products.value = tmp;
        })
    }

    const formatDate = date => {
      if (date instanceof Date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
        return date.toLocaleDateString('en-US', options);
      } else {
        return '';
      }
    };

    const toggle = async (data, id) => {
      data.done = !data.done,
      data.dataChanged = new Date(),
      setDoc(doc(db, 'Product', id), data)
    }

    
    const btn = computed(() => {
      return isEdit.value ? 'Update' : 'Add';
    });

    const addData = async () => {
      if (!itemData.value || !typeData.value || !amountDAta.value) {
        showEmptyFieldsMessage.value = true;
        return;
      }else{
        const data = {
          dateAdded: new Date(),
          item: itemData.value,
          type: typeData.value,
          amount: parseFloat(amountDAta.value),
        };
        
        if (isEdit.value) {
          await updateData(editId.value, data);
        } else {
          await addDoc(collection(db, 'Product'), data);
        }
      }


      itemData.value = '';
      typeData.value = '';
      amountDAta.value = '';
      isEdit.value = false;
      editId.value = null;
      showEmptyFieldsMessage.value = false;
    };


    const editData = async (id) => {
      const product = products.value.find(product => product.id === id);
      itemData.value = product.data.item;
      typeData.value = product.data.type;
      amountDAta.value = product.data.amount;
      isEdit.value = true;
      editId.value = id;
    };


    const updateData = async (id, data) => {
      await updateDoc(doc(db, 'Product', id), data);
      isEdit.value = false;
      editId.value = null;
    };


    const deleteData = async (data, id) => {
        const alert = confirm(`Are you sure you want to delete this item?`)
        if(alert){
          await deleteDoc(doc(db, 'Product', id))
          products.value.splice(data, 0)
        }

        itemData.value = '';
        typeData.value = '';
        amountDAta.value = '';
        isEdit.value = false;
        editId.value = null;
    }

    const totalAmount = computed(() => {
      return products.value.reduce((total, product) => total + product.data.amount, 0);
    });


    onMounted(()=> {
      getProduct();
    })

</script>

<template>
    <div class=" w-full min-h-screen p-9 bg-slate-50 flex text-md">
        <div class="relative bg-slate-400  mt-20 mx-10 w-1/3 h-3/5 flex flex-col p-5 rounded shadow-gray-700 shadow-lg">
           <form @submit.prevent="addData" class=" w-full h-3/5 flex flex-col p-5">
              <h1 class="absolute -top-16 left-16 text-5xl font-bold">Expense Tracker</h1>
              <label for="item" class="mb-2 font-bold">Item</label>
              <input type="text" id="item" name="item" class=" rounded" v-model="itemData"> 
              <div v-if="!itemData && showEmptyFieldsMessage" class="text-red-500">Item must not be empty!</div>

              <label for="category" class="mb-2 mt-4 font-bold">Category</label>
              <select name="category" id="category" class=" rounded text-md" v-model="typeData">
                <option value="" disabled selected>Select Category</option>
                <option value="Electronic Device">Electronic Device</option>
                <option value="Clothing and Apparel">Clothing and Apparel</option>
                <option value="Home and Kitchen Appliance">Home and Kitchen Appliance</option>
                <option value="Sport and Outdoor Gear">Sports and Outdoor Gear</option>
                <option value="Beverage">Beverage</option>
              </select>
              <div v-if="!typeData && showEmptyFieldsMessage" class="text-red-500">Category must not be empty!</div>

              <label for="amount" class="mb-2 mt-4 font-bold">Amount</label>
              <input type="number" id="amount" name="amount" class=" rounded" v-model="amountDAta">
              <div v-if="!amountDAta && showEmptyFieldsMessage" class="text-red-500">Amount must not be empty!</div>

              <div class="flex justify-start mt-6 items-center text-white bg-blue-700 w-20 rounded">
                <button class="border-2 text-black w-20 hover:opacity-80 hover:border-1 hover:border-black hover:text-white transition ease-linear duration-100 p-1" type="submit">{{ btn }}</button>
              </div>
            </form>
        </div>

        <div class="relative w-3/5 border border-black rounded">
          <div class="overflow-auto h-4/5 p-2">
              <table class="table-auto w-full">
                  <thead class="border-b-2 border-black">
                      <tr class="text-left">
                          <th class="">Date & Time</th>
                          <th>Item</th>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>Action</th>
                      </tr>
                  </thead>
                  <tbody v-for="product in products" :key="product.id">
                      <tr>
                          <td class="">{{ formatDate(product.data.dateAdded) }}</td>
                          <td>{{product.data.item}}</td>
                          <td>{{product.data.type}}</td>
                          <td class="">
                            {{ product.data.amount }}
                          </td>
                          <td class="flex items-center gap-3 p-2">
                            <button  @click="editData(product.id)">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-500">
                              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                              </svg>
                            </button>
                            <button @click="deleteData(product.data, product.id)">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-red-500">
                              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </button>
                          </td>
                      </tr>
                  </tbody>
              </table>
          </div>
          <div class="absolute bottom-16 -right-5 text-white text-md">
            <div class="flex min-w-38 justify-start p-2 mr-28 bg-yellow-600">
                <h1><span class="font-bold">Total Expenses:</span> {{ totalAmount  }}</h1>
            </div>
          </div>
        </div>
    </div>
</template>