class UpdateFeedsToReferenceReview < ActiveRecord::Migration[6.0]
  def change
    # Eliminar la referencia a `beer`
    remove_reference :feeds, :beer, foreign_key: true

    # Agregar la referencia a `review`
    add_reference :feeds, :review, null: false, foreign_key: true
  end
end
