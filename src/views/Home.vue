<template>
  <b-container fluid style="margin-top: 10px;" id="linter">
    <b-row>
      <b-col md="5">
        <h3>Source Code
          <small>( paste your code here )</small>
          <b-button variant="warning" @click="lint" class="pull-right" size="sm"
                    :disabled="linting">
            {{linting?'Linting...':'Lint'}}
          </b-button>
        </h3>
        <editor
          v-model="sourceCode"
          :options="options"
          @init="sourceCodeEditorInit"
        ></editor>
      </b-col>
      <b-col md="3">
        <h3>Messages&nbsp;
          <b-badge variant="danger"
                   v-if="messages.filter(d=>d.severity === 2).length > 0">
            {{messages.filter(d=>d.severity === 2).length || 0}}
          </b-badge>&nbsp;
          <b-badge variant="warning"
                   v-if="!filterWarning && messages.filter(d=>d.severity === 1).length > 0">
            {{messages.filter(d=>d.severity === 1).length || 0}}
          </b-badge>
          <b-button @click.prevent="toggleLevel"
                    :variant="filterWarning? 'outline-danger': 'outline-warning'"
                    size="sm">
            Level: {{ filterWarning? 'ERROR': 'WARN'}}
          </b-button>
        </h3>
        <ul id="lint-messages">
          <li v-for="(item, index) in messages" :key="index"
              @click="gotoLine(item.line, item.column)"
              :class="{warning: item.severity === 1}" v-show="!filterWarning || item.severity === 2">
            <span class="position">{{ item.line + ':' + item.column }}</span> -
            <span class="nodeType">{{ item.nodeType }}</span>
            <span class="message">{{ item.message }}</span>
            ( <a :href="`https://eslint.org/docs/rules/${item.ruleId}`"
                 target="_blank" class="ruleId">{{ item.ruleId }}</a> )
            <span class="source">{{ item.source }}</span>
          </li>
        </ul>
      </b-col>
      <b-col md="4">
        <h3>Autofixed Code</h3>
        <editor
          v-model="fixedCode"
          :options="options"
          @init="fixedCodeEditorInit"
        ></editor>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import * as ace from 'brace';
  import Linter from 'eslint/lib/linter.js'
  import * as parser from 'babel-eslint'
  import editor from '../components/VueBrace'
  import rules from '../lint/rules'
  import globals from '../lint/globals'

  export default {
    name: 'Home',
    components: {
      editor
    },
    data() {
      return {
        filterWarning: false,
        linting: false,
        sourceCode: `var a = 1\nvar b = c\n\nconsole.log(d)`,
        fixedCode: '',
        messages: [],
        rules,
        options: {
          highlightActiveLine: true,
          highlightSelectedWord: true,
          useWorker: false, // disable ace lint
        },
        sourceCodeEditor: null,
        fixedCodeEditor: null,
      }
    },
    methods: {
      // get editor object
      sourceCodeEditorInit(editor) {
        this.sourceCodeEditor = editor
      },
      // get editor object
      fixedCodeEditorInit(editor) {
        this.fixedCodeEditor = editor
      },
      // lint code
      lint() {
        this.linting = true

        // fix waiting linting dom update
        setTimeout(() => {

          let linter = new Linter()

          // define parser: use 'babel-eslint'
          linter.defineParser('nabulas-parser', parser);

          // define custom rules
          linter.defineRule('disallow-methods', {
            create(context) {
              var disallowedMethods = context.options[0];

              return {
                "CallExpression": function (node) {
                  disallowedMethods.forEach(function (disallowedMethod) {

                    if ((node.callee.name && node.callee.name === disallowedMethod)
                      || (node.callee.property && node.callee.property.name && node.callee.property.name === disallowedMethod)) {
                      context.report(node, `Unsupported method: '${disallowedMethod}'.`);
                    }
                  });
                }
              };
            }
          });

          // verify config
          const opts = {
            root: true,
            parser: 'nabulas-parser',
            env: {
              browser: false,
              node: true,
              es6: true,
            },
            globals,
            rules: this.rules
          }

          let result = linter.verify(this.sourceCode, opts)
          console.log(result);
          this.messages = result || []

          let fixed = linter.verifyAndFix(this.sourceCode, opts)
          this.fixedCode = fixed.output || ''

          this.markError(!this.filterWarning)

        }, 50)

        // stop loading
        setTimeout(() => {
          this.linting = false
        }, 1500)

      },
      // set level
      toggleLevel() {
        this.filterWarning = !this.filterWarning
        this.markError(!this.filterWarning)
      },

      // mark annotations
      markError(showWarning = true) {
        this.sourceCodeEditor.getSession().clearAnnotations()
        this.sourceCodeEditor.getSession()
          .setAnnotations(this.messages
            .filter(d => {
              return showWarning || d.severity === 2
            })
            .map(d => {
              return {
                row: d.line - 1,
                column: d.column,
                text: d.message,
                type: d.severity === 2 ? 'error' : 'warning',
              }
            }));
      },

      // go to line
      gotoLine(line, column) {
        if (line && column) {
          this.sourceCodeEditor.gotoLine(line, column, true)
        }
      }
    }
  }
</script>
