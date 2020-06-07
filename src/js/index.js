import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import {elements, renderLoader ,clearLoader} from './views/base';
import Likes from './models/Likes';
import * as likesView from './views/likesView';

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state={}
//window.state =state;                                                    

/*SEARCH CONTROLLER*/ 
const controlSearch= async () => {
    //get a query from view
    const query=searchView.getInput();
    //console.log(query);


    if(query){
        //new search object and add to state
        state.search=new Search(query);
    // const query=searchView.bad boys song boys songput();
    // console.log(query);
        //prepare ui for result
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try{

        //search for recipes
        await state.search.getResults();

        //render results from ui
        //console.log(state.search.result);
        clearLoader();
        searchView.renderResults(state.search.result);
        }catch(err){
            alert('Something wrong with the Search...');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit',e=>{
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click', e =>{
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage= parseInt(btn.dataset.goto,10);
        console.log(goToPage);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/*RECIPE CONTROLLER*/
const controlRecipe =async () =>{
    //get id from url
    const id= window.location.hash.replace('#','');
    //console.log(id);
    if(id){
        //prepare ui for changes
        renderLoader(elements.recipe);
        recipeView.clearRecipe();

        // highligh the selected search item
        if(state.search) searchView.highlightSelected(id);
        
        //create new recipe object
        state.recipe = new Recipe(id);
  
        try{
        //get recipe data and parseingredients
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();
        
        //calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();
        
        //render recipe
        clearLoader();
        recipeView.renderRecipe(
            state.recipe,
            state.likes.isLiked(id)
            );

        }catch (err){
            alert(err);
        }
    }
}
['hashchange','load'].forEach(event => window.addEventListener(event ,controlRecipe));

/*List Controller */
const controlList = () => {
    //create a new list if there is none yet
    if(!state.list) state.list = new List();

    //add each ingredient to the list and ui
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit ,el.ingredient);
        listView.renderItem(item); 
    });
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

    // Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/** Like Controller */
const controlLike =() =>{
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    
    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);

    // User HAS liked current recipe
} else {
    // Remove like from the state
    state.likes.deleteLike(currentID);

    // Toggle the like button
    likesView.toggleLikeBtn(false);

    // Remove like from UI list
    likesView.deleteLike(currentID);
}
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//restore liked recipes om page load
window.addEventListener('load',()=>{
    state.likes = new Likes();

    //Restore likes
    state.likes.readStorage();

    //toggke like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing Likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


// handling recipe button clicks
elements.recipe.addEventListener('click',e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        //decrease btn is clicked
        if(state.recipe.Servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngrediants(state.recipe);
        }
        
    }else if(e.target.matches('.btn-increase, .btn-increase *')){
        //increase btn is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngrediants(state.recipe);
    }else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        // Add items to shopping list
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        //Like controller
        controlLike();
    }
    //console.log(state.recipe);
});

//window.l=  new List();