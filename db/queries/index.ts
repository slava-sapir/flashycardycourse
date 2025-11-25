/**
 * Centralized database query helpers
 * 
 * All database operations should be performed through these helper functions
 * to ensure proper security, user isolation, and code reusability.
 * 
 * @see .cursor/rules/secure-database-queries.mdc for security guidelines
 */

// Re-export all deck queries
export {
  getUserDecks,
  getUserDeckById,
  getUserDeckWithCardCount,
  getUserDeckCount,
  createDeck,
  updateDeck,
  deleteDeck,
  duplicateDeck,
} from "./decks"

// Re-export all card queries
export {
  getDeckCards,
  getCardById,
  getRandomCardFromDeck,
  createCard,
  updateCard,
  deleteCard,
  createManyCards,
} from "./cards"

