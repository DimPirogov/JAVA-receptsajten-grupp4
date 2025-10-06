import './App.css'
import RecipeSearch from './components/RecipeSearch'

export default function App() {
  return (
    <div className="App">
      <h1>Grupp 4 Receptsajt 🍽️</h1>
      <p>Sök efter recept med ingredienser eller namn</p>
      <RecipeSearch />
    </div>
  )
}
