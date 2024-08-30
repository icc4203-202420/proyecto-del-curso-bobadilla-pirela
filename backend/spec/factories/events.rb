FactoryBot.define do
  factory :event do
    name { "Event Name" }
    description { "Event Description" }
    date { 1.day.from_now }
    association :bar
  end
end