import asyncio
from pydantic import BaseModel
from pypollinations import TextClient, TextGenerationRequest
from pypollinations.models.base import Message, TextModel
from pypollinations.exceptions import PollinationsError
from rich.console import Console

console = Console()


class Conversation:
    def __init__(self):
        self.client = TextClient()
        self.history = [
            Message(
                role="system",
                content="Вы очень полезный помощник для написания и исправления кода. Отвечать кротко, но емко. Не совершайте ошибок и не отвечайте не на то. Пишите только на русском языке. Если не знаете ответа, скажите что не знаете, а не напишите что-то случайное.",
            )
        ]
    
    def add_message(self, role, content):
        self.history.append(Message(
            role=role,
            content=content
        ))
    
    async def get_response(self, user_message):
        self.add_message("user", user_message)
        
        request = TextGenerationRequest(
            messages=self.history,
            model=TextModel.OPENAI,
            jsonMode=False,
            seed=41,
            temperature=0.5,
            frequency_penalty=0.0,
            presence_penalty=0.0,
            top_p=1.0,
            # system="Ты опытный AI асистент. Отвечай кратко, но емко на русском языке",
        )
        response = await self.client.generate(request)

        yield response.content
            
        self.add_message("assistant", response.content)

async def main():
    conversation = Conversation()
    
    while True:
        user_input = input("\n> ")
        
        if user_input.lower() == '/exit':
            console.print("\nДо встречи!", markup=True)
            break
            
        async for response in conversation.get_response(user_input):
            console.print(response, markup=True)

if __name__ == "__main__":
    asyncio.run(main())
    

# class CommandField(BaseModel):
#     command: str
#     description: str
    
    
# class Commands(BaseModel):
#     help: CommandField = CommandField(command="/help", description="Показать эту справку")
#     context: CommandField = CommandField(command="/context", description="Показать историю диалога")
#     new_context: CommandField = CommandField(command="/new_context", description="Очистить историю диалога")
#     exit: CommandField = CommandField(command="/exit", description="Выйти")
    
#     def get_help(self):
#         commands = []
#         for k, v in self.__dict__.items():
#             if k.startswith("_"):
#                 continue
            
#             commands.append(f"{v.command} - {v.description}")
#         return """Комманды:\n    """ + "\n    ".join(commands)
    
#     def get_command(self, text: str) -> CommandField | None:
#         for k, v in self.__dict__.items():
#             if k.startswith("_"):
#                 continue
            
#             if text == v.command:
#                 return getattr(self, k)


# # async def t():
# #     client = TextClient()
# #     request = TextGenerationRequest(
# #         messages=[Message(role="user", content="What is artificial intelligence?")],
# #         model=TextModel.OPENAI,
# #         jsonMode=True,
# #         seed=41,
# #         temperature=0.5,
# #         frequency_penalty=0.0,
# #         presence_penalty=0.0,
# #         top_p=1.0,
# #         system="Ты опытный AI асистент. Отвечай кратко, но емко на русском языке",
# #     )

# #     response = await client.generate(request)
# #     print(f"Response: {response.content}")
    
    
# # asyncio.run(t())


# async def generate_text(messages: list[str], system: str = "Ты опытный AI асистент. Отвечай кратко, но емко на русском языке."):
#     client = TextClient()

#     msg = [Message(role="user", content=text) for text in messages]
    
#     try:
#         request = TextGenerationRequest(
#             messages=msg,
#             model=TextModel.OPENAI,
#             jsonMode=False,
#             seed=41,
#             temperature=0.5,
#             frequency_penalty=0.0,
#             presence_penalty=0.0,
#             top_p=1.0,
#             system=system,
#         )
#         print("Generating response...\n")
#         try:
#             response = await client.generate(request)
#             print(f"Response: {response.content}")
#             # print(f"Model: {response.model}")
#             # print(f"Seed: {response.seed}")
#             # print(f"Temperature: {response.temperature}")
#             # print(f"Frequency penalty: {response.frequency_penalty}")
#             # print(f"Presence penalty: {response.presence_penalty}")
#             # print(f"Top p: {response.top_p}")

#         except Exception as e:
#             print(f"Failed to generate response: {e}")
#             raise

#         # print("\nFetching available models...")
#         # try:
#         #     models = await client.list_models()
#         #     print("\nAvailable models:")
#         #     for model in models:
#         #         print(f"- {model['name']}: {model.get('type', 'unknown')}")
#         # except Exception as e:
#         #     print(f"Failed to fetch models: {e}")

#     except PollinationsError as e:
#         print(f"API Error: {e}")
#     except Exception as e:
#         print(f"Unexpected error: {type(e).__name__}: {e}")
#     finally:
#         await client.close()

            
# if __name__ == "__main__":
#     commands = Commands()
    
#     context = []

#     print(commands.get_help())
    
#     while True:
#         input_ = input("> ")
        
#         command = commands.get_command(input_)
        
#         if command is not None:
#             if command == commands.help:
#                 print(commands.get_help())
#             elif command == commands.new_context:
#                 context.clear()
#                 print("Контекст очищен")
#             elif command == commands.context:
#                 print("Контекст:" + (" пусто" if context.__len__() == 0 else "\n"+"\n    ".join(context)))
#             elif command == commands.exit:
#                 break
            
#             continue
            
#         context.append(input_)
#         asyncio.run(generate_text(
#             messages=context
#         ))
