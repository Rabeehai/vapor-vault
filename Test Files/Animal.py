import random

class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "Some noise"

class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} says Meow!"

class Duck(Animal):
    def speak(self):
        return f"{self.name} says Quack!"

class Programmer(Animal):
    def speak(self):
        return f"{self.name} says I need coffee!"

def random_animal(name):
    animals = [Dog, Cat, Duck, Programmer]
    return random.choice(animals)(name)

def main():
    print("Welcome to the Random Animal Generator!")
    name = input("Enter a name for the animal: ")

    # Let's get a random animal
    animal = random_animal(name)

    if isinstance(animal, Programmer):
        print("Congratulations! You got a rare species!")
    else:
        print("You got a regular animal!")

    print(animal.speak())

    # Some humor on Coders
    if isinstance(animal, Programmer):
        action = input(f"Do you want {name} to code (y/n)? ")
        if action == 'y':
            print(f"{name} started coding... but first, they searched on StackOverflow.")
        else:
            print(f"{name} decided to take a break. Probably playing video games.")

main()
