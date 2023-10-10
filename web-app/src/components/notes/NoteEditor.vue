<template>
  <!-- <div v-if="editor" class="h-[var(--tg-viewport-stable-height)]"> -->
  <div v-if="editor" class="min-h-[79vh]">
    <header
      v-if="isEditable"
      class="absolute w-full flex flex-row items-center h-10 z-10 border-b border-gray-200 dark:border-gray-600 bg-tg-bg px-2 animate-in ease-in duration-300 fade-in"
      :style="{ top: `${topToolbarOffset}px` }"
      :class="{ hidden: !isToolbarsShouldBeVisible }"
    >
      <div class="flex-1 invisible"></div>
      <slot name="actions"></slot>
    </header>
    <div ref="editorContainerElement">
      <editor-content
        class="min-h-[79vh] p-3"
        :class="{
          'my-10': isEditable,
          'my-0': !isEditable
        }"
        :editor="editor"
      />
    </div>
    <footer
      v-if="isEditable"
      ref="bottomToolbarElement"
      class="absolute flex flex-row w-full items-center h-12 z-10 border-t border-gray-200 dark:border-gray-600 space-x-1 border-grey bg-tg-bg px-2 animate-in ease-in duration-300 fade-in overflow-x-auto no-scrollbar"
      :style="{ top: `${bottomToolbarOffset}px` }"
      :class="{ hidden: !isToolbarsShouldBeVisible }"
    >
      <div class="join">
        <button
          class="btn btn-sm join-item"
          :class="{
            'btn-tg-secondary': !editor.isActive('bold'),
            'btn-tg-primary': editor.isActive('bold')
          }"
          @mousedown.prevent="editor.chain().focus().toggleBold().run()"
        >
          <b>B</b>
        </button>
        <button
          class="btn btn-sm join-item"
          :class="{
            'btn-tg-secondary': !editor.isActive('italic'),
            'btn-tg-primary': editor.isActive('italic')
          }"
          @mousedown.prevent="editor.chain().focus().toggleItalic().run()"
        >
          <i>I</i>
        </button>
        <button
          class="btn btn-sm join-item"
          :class="{
            'btn-tg-secondary': !editor.isActive('strike'),
            'btn-tg-primary': editor.isActive('strike')
          }"
          @mousedown.prevent="editor.chain().focus().toggleStrike().run()"
        >
          <s>S</s>
        </button>
      </div>

      <button
        class="btn btn-sm"
        :class="{
          'btn-tg-secondary': !editor.isActive('highlight'),
          'btn-tg-primary': editor.isActive('highlight')
        }"
        @mousedown.prevent="editor.chain().focus().toggleHighlight().run()"
      >
        <icon-highlight class="w-4 h-4" />
      </button>
      <button
        class="btn btn-sm"
        :class="{
          'btn-tg-secondary': !editor.isActive('heading', { level: 1 }),
          'btn-tg-primary': editor.isActive('heading', { level: 1 })
        }"
        @mousedown.prevent="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        H
      </button>

      <div class="grow"></div>

      <div class="join">
        <button
          class="btn btn-square btn-sm join-item"
          :class="{
            'btn-tg-secondary': !editor.isActive('bulletList'),
            'btn-tg-primary': editor.isActive('bulletList')
          }"
          @mousedown.prevent="editor.chain().focus().toggleBulletList().run()"
        >
          <icon-list-bullet class="w-4 h-4" />
        </button>
        <button
          class="btn btn-square btn-sm join-item"
          :class="{
            'btn-tg-secondary': !editor.isActive('orderedList'),
            'btn-tg-primary': editor.isActive('orderedList')
          }"
          @mousedown.prevent="editor.chain().focus().toggleOrderedList().run()"
        >
          <icon-list-ordered class="w-5 h-5" />
        </button>
        <button
          class="btn btn-square btn-sm join-item"
          :class="{
            'btn-tg-secondary': !editor.isActive('taskList'),
            'btn-tg-primary': editor.isActive('taskList')
          }"
          @mousedown.prevent="editor.chain().focus().toggleTaskList().run()"
        >
          <icon-list-checklist class="w-5 h-5" />
        </button>
      </div>

      <div class="join">
        <button
          class="btn btn-square btn-sm join-item"
          :class="{
            'btn-tg-secondary': editor.can().undo()
          }"
          :disabled="!editor.can().undo()"
          @mousedown.prevent="editor.chain().focus().undo().run()"
        >
          <icon-undo class="w-4 h-4" />
        </button>
        <button
          class="btn btn-square btn-sm join-item"
          :class="{
            'btn-tg-secondary': editor.can().redo()
          }"
          :disabled="!editor.can().redo()"
          @mousedown.prevent="editor.chain().focus().redo().run()"
        >
          <icon-redo class="w-4 h-4" />
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { isIOS, onStartTyping, useScroll } from '@vueuse/core'
import { useVisualViewport } from '@/composables/useVisualViewport'
import IconListBullet from '@/components/icons/IconListBullet.vue'
import IconListOrdered from '@/components/icons/IconListOrdered.vue'
import IconUndo from '@/components/icons/IconUndo.vue'
import IconRedo from '@/components/icons/IconRedo.vue'
import IconListChecklist from '@/components/icons/IconListChecklist.vue'
import IconHighlight from '@/components/icons/IconHighlight.vue'

import { EditorContent, useEditor } from '@tiptap/vue-3'
import Focus from '@tiptap/extension-focus'
import { History } from '@tiptap/extension-history'
import { Document } from '@tiptap/extension-document'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Text } from '@tiptap/extension-text'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Bold } from '@tiptap/extension-bold'
import { Italic } from '@tiptap/extension-italic'
import { Strike } from '@tiptap/extension-strike'
import { Heading } from '@tiptap/extension-heading'
import { BulletList } from '@tiptap/extension-bullet-list'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { ListItem } from '@tiptap/extension-list-item'
import { Highlight } from '@tiptap/extension-highlight'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { convertRemToPixels } from '@/helpers/styles'
// import { createLine } from '@/helpers/debug'

const content = defineModel<string>('content', {
  required: true
})
const props = defineProps({
  editable: Boolean
})

const topToolbarHeight = convertRemToPixels(2.5) // h-10
const bottomToolbarHeight = convertRemToPixels(3) // h-12

const editorContainerElement = ref<HTMLElement | null>(null)
const bottomToolbarElement = ref<HTMLElement | null>(null)

const { visualViewport } = useVisualViewport()
const {
  y: scrollY,
  isScrolling,
  arrivedState
} = useScroll(window.document, {
  behavior: 'smooth'
})

const isEditable = computed(() => props.editable)
const isToolbarsShouldBeVisible = computed(() => {
  if (!isEditable.value) {
    return false
  }

  if (arrivedState.bottom || arrivedState.top) {
    return true
  }

  return isScrolling.value === false
})
const topToolbarOffset = computed(() => Math.floor(scrollY.value))
const bottomToolbarOffset = computed(() =>
  Math.floor(scrollY.value + visualViewport.value - bottomToolbarHeight)
)

// TODO: dynamic resize editor to match visual viewport size on iOS
const iOSFiller = '<p></p>'.repeat(20)
const isIOSEmptyNote = content.value === '' && isIOS

const editor = useEditor({
  content: isIOSEmptyNote ? iOSFiller : content.value,
  editable: isEditable.value,
  editorProps: {
    attributes: {
      class: 'note note-body min-h-[79vh] focus:outline-none'
    }
  },
  extensions: [
    Document,
    Placeholder.configure({
      emptyNodeClass:
        'first:before:text-gray-400 first:before:text-opacity-40 first:before:float-left first:before:content-[attr(data-placeholder)] first:before:pointer-events-none first:before:h-0',
      placeholder: 'Take a note…'
    }),
    Paragraph,
    Text,
    Bold,
    Italic,
    Strike,
    Heading.configure({
      levels: [1]
    }),
    ListItem,
    BulletList,
    OrderedList,
    TaskList,
    TaskItem.configure({
      nested: true,
      // TODO: Replace when https://github.com/ueberdosis/tiptap/issues/3676 is fixed
      // @ts-expect-error
      onReadOnlyChecked: (_1, _2, html) => {
        content.value = html
      }
      // onReadOnlyChecked: () => true,
    }),
    Highlight,
    History.configure({
      depth: 10
    }),
    Focus.configure({
      className: 'focus',
      mode: 'deepest'
    })
  ],
  onUpdate({ editor }) {
    content.value = editor.getHTML()
  },
  onSelectionUpdate({ editor }) {
    const { empty } = editor.state.selection
    // empty && setTimeout(scrollToCaret, 10)
    empty && nextTick(scrollToCaret)
  },
  onFocus({ editor }) {
    const { empty } = editor.state.selection
    // empty && setTimeout(scrollToCaret, 10)
    empty && nextTick(scrollToCaret)
  }
  // onTransaction({ editor }) {
  //   const { empty } = editor.state.selection
  //   empty && scrollToCaret()
  // },
})

// const caretTopLine = createLine('caret top', 'blue')
// const caretBottomLine = createLine('caret bottom', 'green')
// const viewportTopLine = createLine('viewport top', 'red')
// const viewportBottomLine = createLine('viewport bottom', 'yellow')

function scrollToCaret() {
  if (!isEditable.value) return

  const calculateViewportBoundaries = () => ({
    topBoundary: scrollY.value + topToolbarHeight,
    bottomBoundary: scrollY.value + visualViewport.value - bottomToolbarHeight
  })

  const calculateCaretBoundaries = () => {
    const selection = document.getSelection()
    if (selection && selection.rangeCount === 1) {
      const range = selection.getRangeAt(0)

      const rangeCharsCounts = range.endOffset - range.startOffset
      // abort if text selection
      if (rangeCharsCounts > 0) {
        return
      }

      if (range.getClientRects().length === 1) {
        const { top, height } = range.getClientRects()[0]

        return {
          topBoundary: scrollY.value + top,
          bottomBoundary: scrollY.value + top + height
        }
      } else {
        const element = document.querySelector('.focus')
        const offsetTop = element?.getBoundingClientRect().top ?? 0
        const elementHeight = element?.scrollHeight ?? 0

        return {
          topBoundary: scrollY.value + offsetTop,
          bottomBoundary: scrollY.value + offsetTop + elementHeight
        }
      }
    }
  }

  const caret = calculateCaretBoundaries()
  // caretTopLine.setPosition(caret?.topBoundary ?? 0)
  // caretBottomLine.setPosition(caret?.bottomBoundary ?? 0)

  const viewport = calculateViewportBoundaries()
  // viewportTopLine.setPosition(viewport.topBoundary)
  // viewportBottomLine.setPosition(viewport.bottomBoundary)

  if (caret) {
    if (caret.topBoundary <= viewport.topBoundary) {
      window.scrollTo({
        behavior: 'smooth',
        top: caret.topBoundary - topToolbarHeight * 1.25
      })
    } else if (caret.bottomBoundary >= viewport.bottomBoundary) {
      window.scrollTo({
        behavior: 'smooth',
        top: caret.bottomBoundary - visualViewport.value + bottomToolbarHeight * 1.25
      })
    }
  }
}

watch(visualViewport, () => {
  scrollToCaret()
})

watch(isEditable, (value) => {
  editor.value?.setEditable(value)
})

onStartTyping(() => {
  editor.value?.commands.focus('end')
})

onMounted(() => {
  // move cursor to end of content
  isIOS
    ? editor.value?.commands.setTextSelection(0)
    : editor.value?.commands.setTextSelection(99999)
  document.addEventListener('keyup', scrollToCaret)
})

onUnmounted(() => {
  document.removeEventListener('keyup', scrollToCaret)
})

defineExpose({
  focus() {
    isIOS ? editor.value?.commands.focus('start') : editor.value?.commands.focus('end')
  }
})
</script>
